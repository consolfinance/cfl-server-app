module.exports = {
	routes: [
		{
			method: "PUT",
			path: "/users/me",
			handler: "01-custom-loan-application.updateMe",
		},
		{
			method: "POST",
			path: "/loan-applications/new",
			handler: "01-custom-loan-application.createApplication",
		},
		{
			method: "GET",
			path: "/loan-applications/user",
			handler: "01-custom-loan-application.getAllUserApplications",
		},
		{
			method: "GET",
			path: "/loan-applications/user/:id",
			handler: "01-custom-loan-application.getUserApplication",
		},
		{
			method: "PUT",
			path: "/loan-applications/user/:id",
			handler: "01-custom-loan-application.updateUserApplication",
		},
	],
};
