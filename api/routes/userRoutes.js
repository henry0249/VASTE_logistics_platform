'use strict';
module.exports = function(app)
{
  var userRoutes = require('../controllers/userController');

  // userRoutes Routes
  app.route('/users')
    .get(userRoutes.list_all_users)
    .post(userRoutes.create_a_users);

  app.route('/usersbycompany/:companyID')
    .get(userRoutes.get_company_drivers);
  //app.route('/users/find_user_by_ID')
	//.post(userRoutes.find_user_by_ID);
  app.route('/getCompanyDrivers')
    .get(userRoutes.get_company_drivers);
  app.route('/createDriver')
    .post(userRoutes.create_a_driver);
  app.route('/users/identification')
	 .post(userRoutes.identification);
  app.route('/users/apiidentification')
 	 .post(userRoutes.apiidentification);
  app.route('/users/updatePassword')
  	.post(userRoutes.update_a_users);
  app.route('/users/remove')
    .post(userRoutes.delete_a_users);
  app.route('/users/getUser')
    .post(userRoutes.get_api_user);
  app.route('/users/getResetUser')
    .post(userRoutes.read_a_users);
  app.route('/users/resetPassword')
    .post(userRoutes.reset_a_user);
	app.route('/createCustomer')
		.post(userRoutes.create_a_customer);
	app.route('/users/customerauth')
		.post(userRoutes.customer_identification);
	app.route('/users/customerupdatepass')
		.post(userRoutes.update_a_customers);
	app.route('/getUsers')
		.post(userRoutes.list_all_userids);
	app.route('/getUserByMail')
		.post(userRoutes.find_customer_by_mail);
	app.route('/createConfirmUser')
		.post(userRoutes.create_a_user_from_confirm);
  app.route('/appCreateCustomer')
    .post(userRoutes.create_a_customer);

  app.route('/getdrivers')
    .get(userRoutes.getDrivers);

  app.route('/users/:usersId')
    .get(userRoutes.read_a_users)
    .post(userRoutes.update_a_users)
};
