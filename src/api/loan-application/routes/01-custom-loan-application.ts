module.exports = {
	routes: [
		{
			method: "PUT",
			path: "/users/me",
			handler: "01-custom-loan-application.updateMe",
		},
	],
};
