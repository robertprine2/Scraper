// requiring the connection to the db passing in the username and password 
var db = require('./connection.js');
var encrypto = require('crypto');
var salt = 'salt orsomething';
var password;
var newPass;


var orm = {

	// Add user using the registration form information
	addUser: function(userEmail, password, user, firstN, lastN, image, userAddress, userCity, userState, userZip, phone) {

		var post = [
			userEmail, 
			password,
			user,
			firstN,
			lastN,
			image,
			userAddress,
			userCity,
			userState,
			userZip,
			phone
		];

		var query = db.query('INSERT INTO users (email, userPassword, userName, firstName, lastName, userImage, address, city, state, zip, phoneNumber) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)', post, function(err, result) {
			if (err) throw err;
			console.log(result);
		});
		console.log(query.sql)
	}, // end of addUser function

	// ************needs to be added to routes
	// searches different tables based on column and value of the column
	searchTable: function(tableInput, colToSearch, valOfCol,res,user) {
		console.log(valOfCol);
		
		var queryString = 'SELECT * FROM ' + tableInput + ' WHERE ' + colToSearch + ' LIKE ?';
		 db.query(queryString, [valOfCol], function(err, result) {
			if (err) throw err;
			
			res.render('results',{ layout: 'usermain',
		 						results: result,
		 						user: user
		 					    });
		});
		   

	}, // end of searchTable function

	//search for a specific user in a group
	searchUsersInGroup: function(groupId) {
		var queryString = 'SELECT userId FROM groupmembers WHERE groupId = ?';
		db.query(queryString, [groupId], function(err, userId) {
			if (err) throw err;
			console.log(userId);
			return userId;
		}); // end of query
	}, // end of searchUsersInGroup function

	displayGroup: function(table, column, whatToSearch, pageToSendResult, res, user) {

		var queryString = 'SELECT * FROM ' + table + ' WHERE ' + column + ' = ?';

		console.log(queryString);

		db.query(queryString, whatToSearch, function(err, result) {

			if (err) throw err;

			var groupMemQuery = "SELECT userId FROM groupmembers WHERE groupId=? AND userId=?";

			db.query(groupMemQuery, [whatToSearch, user.userID], function(err2, groupMemRes){

				if (err2) throw err2;

				console.log(groupMemRes);

				var isMemberInGroup = groupMemRes[0] ? user.userID == groupMemRes[0].userId : false;

				var driverQuery = 'SELECT driverUserName FROM drivers WHERE groupId = ? AND driverUserName = ?';
				db.query(driverQuery, [whatToSearch, user.userName], function(err, driverNames) {
					if (err) throw err;

					console.log("driver results ", driverNames);
					console.log("username ", user.userName);
					
					var areYouDriver = driverNames[0] ? user.userName == driverNames[0].driverUserName : false;

					var driverInfoQuery = 'SELECT * FROM drivers WHERE groupId = ?';

					db.query(driverInfoQuery, whatToSearch, function(err, allDriverInfo) {
						if (err) throw err;

						for(var i = 0; i < allDriverInfo.length; i++) {
							console.log(i + ": " + allDriverInfo[i].driverUserName);
							console.log(i + ": " + allDriverInfo[i].seatsAvailable);
							console.log(i + ": " + allDriverInfo[i].dateDriving);
						}

				  		res.render(pageToSendResult, {
					  		layout: 'usermain',
						 	results: result,
						 	user: user,
						 	isMemberInGroup: isMemberInGroup,
						 	areYouDriver: areYouDriver,
						 	allDriverInfo: allDriverInfo});
				  	}); // end of driverInfo query
			  	}); // end of driverUserName query
			}); // end of groupMemQuery
		}); // end of stringQuery

	}, // end of display group function

	// add a group to a user that is joinable by other users
	addGroup: function(groupName, groupDescription,user,resolved) {

		var post = [
			groupName,
			groupDescription,
			user
		];

		var query = db.query('INSERT INTO groups (groupName, groupDescription, createdBy, meet, pickUp) VALUES (?, ?, ?, false, false)', post, function(err, result) {
			if (err) throw err;
			console.log(result);
			resolved();
		});
		console.log(query.sql);
	}, // end of addGroup function

	// ************needs to be added to routes
	// adds a group member to a group - could be a one line form on the group page to invite others or a join button for the person joining the group
	addGroupMember: function(groupName, memberUserName) {

		var post = [
			groupName,
			memberUserName
		];

		var query = db.query('INSERT INTO groupMembers (groupID, userID) VALUES (?, ?)', post, function(err, result) {
			if (err) throw err;
			console.log(result);
		});
		console.log(query.sql)
	}, // end of addGroupMember function

	// ************needs to be added to routes
	// adds driver to drivers table and presets milesDriven, daysDriving, timeHoursDriving, driverRating since those will be modified in other areas/as they drive more
	addDriver: function(id, UserName, seats, date) {

		var post = [
			id,
			UserName,
			seats,
			date
		];

		var query = db.query('INSERT INTO drivers (groupId, driverUserName, seatsAvailable,  dateDriving, milesDriven, daysDriving, timeHoursDriving, driverRating) VALUES (?, ?, ?, ?, 0, 0, 0, null)', post, function(err, result) {
			if (err) throw err;
			console.log(result);
		});
		
	}, // end of adddriver function

	// ************needs to be added to routes
	// adds passengers to a driver most likely on the group page
	addPassengers: function(driverId, passengerUserId) {

		var post = [
			driverId,
			passengerUserId
		];

		var query = db.query('INSERT INTO passengers (driverId, passengerUserId) VALUES (?, ?)', post, function(err, result) {
			if (err) throw err;
			console.log(result);
		});
		console.log(query.sql)
	}, // end of addPassengers function

	//finds user where username and password match user input
	findUser: function(req ,username, pass, done) {
		console.log(username, pass);

		newPass = encrypto.createHmac('sha256', pass).update(salt).digest('hex');
		
		var queryString = 'SELECT * FROM users WHERE userName = ' + JSON.stringify(username) + ' AND userPassword = ' + JSON.stringify(newPass);

		db.query(queryString, function(err, rows, fields) {
			if (err) throw err;
			
			if (rows[0]) {

				return done(null, {userID:rows[0].userID,
								   userName:rows[0].userName, 
								   firstName: rows[0].firstName, 
								   lastName:rows[0].firstName,
								   email:rows[0].email,
								   userImg:rows[0].userImage

								});
			} else{
				return done(null,null);
			}
		});
		
		
	}, // finds user by username and password,

	// searches for all the groups that a user is in
	searchUserGroups: function(user, res) {
		
		var options = {sql: 'root', nestTables: '_'}
		var queryString = 'SELECT groups.groupName, groups.groupID, groups.groupDescription FROM groups JOIN groupMembers ON groups.groupID = groupmembers.groupId JOIN users ON groupMembers.userId = users.userID WHERE users.userID = ?';
		db.query(queryString, [user.userID], function(err, result) {
			if (err) throw err;
			console.log(result);
			res.render('yourgroups',{ layout: 'usermain',
		 						results: result,
		 					    user: user});
			console.log(result);
		}); // end of query

	}, // end of searchUserGroups function

	// searches for all the drivers that are attached to a group
	searchDrivers: function(driverId, res) {
		
		var options = {sql: 'root', nestTables: '_'}
		var queryString = 'SELECT driverUserName FROM drivers WHERE groupId = ?';
		db.query(queryString, [/*groupId*/], function(err, driverNames) {
			if (err) throw err;
			console.log(driverNames);
			//*********Haven't finished this part!!!! I wanted to test what it returned first
			res.render('displayGroup',{ layout: 'usermain',
		 						names: driverNames,
		 					    user: user});
			console.log(result);
		}); // end of query

	}, // end of searchDrivers function

	// searches for all the passengers that are attached to a driver
	searchPassengers: function(driverId, res) {
		
		var options = {sql: 'root', nestTables: '_'}
		var queryString = 'SELECT users.userName, users.userID FROM users JOIN passengers ON users.userID = passengers.passengerUserId JOIN drivers ON passengers.driverId = drivers.driverId WHERE users.userID = ?';
		//**************still needs to pass the dervers userID which we need to get from the drivers info or data on a driver button
		db.query(queryString, [user.userID], function(err, passengerNames) {
			if (err) throw err;
			console.log(passengerNames);
			//*********Haven't finished this part!!!! I wanted to test what it returned first
			res.render('displayGroup',{ layout: 'usermain',
		 						names: passengerNames,
		 					    user: user});
			console.log(result);
		}); // end of query

	}, // end of searchPassengers function

	// delete a group from MySQL when you press the leave button
	deleteUserGroup: function(groupId, req) {
		var queryString = 'DELETE FROM groupMembers WHERE groupId = ? AND userId = ?';
		console.log(req.user);
		var query = db.query(queryString, [groupId, req.userID], function(err, result) {
			if (err) throw err;
			console.log(result);
			
		}); // end of query
		console.log(query.sql);
	}, // end of deleteUserGroup function

	joinCreatedGroup: function(memberUserName) {

		var post = [
			
			memberUserName
		];

		var query = db.query('INSERT INTO groupMembers (groupID, userID) VALUES (LAST_INSERT_ID(), ?)', post, function(err, result) {
			if (err) throw err;
			console.log(result);
		});
		console.log(query.sql)
	}, // end of addGroupMember function

	updateSeatsAvailable: function(driverID){
		var query = db.query('UPDATE drivers SET seatsAvailable = seatsAvailable - 1 Where driverId = ?', [driverID], function(err, result){
			if (err) throw err;
			console.log(result);
		});
		
		}
	


} // end of orm object

module.exports = orm;
