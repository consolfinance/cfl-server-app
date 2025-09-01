import { Context } from "koa";

const updateMe = async (ctx: Context) => {
	try {
		const userId = ctx.state.user.documentId;
		console.log({ userId, ctxReq: ctx.request, ctxState: ctx.state });
		const data = ctx.request.body;
		const updatedUser = await strapi
			.documents("plugin::users-permissions.user")
			.update({ documentId: userId, data });
		ctx.send(updatedUser);
	} catch (err) {
		console.error(err);
		ctx.internalServerError("Internal server error");
	}
};

const createApplication = async (ctx: Context) => {
	try {
		const userId = ctx.state.user.documentId;
		const data = ctx.request.body;
		const newApplication = await strapi
			.documents("api::loan-application.loan-application")
			.create({ data: { ...data, user: userId }, status: "published" });
		ctx.send(newApplication);
	} catch (err) {
		console.error(err);
		ctx.internalServerError("Internal server error");
	}
};

const getUserApplication = async (ctx: Context) => {
	try {
		const userId = ctx.state.user.id;
		const { id } = ctx.params;

		console.log({
			userId,
			id,
		});

		const application = await strapi
			.documents("api::loan-application.loan-application")
			.findFirst({ filters: { documentId: id, user: userId } });
		if (!application) {
			return ctx.notFound("Application not found");
		}
		ctx.send(application);
	} catch (err) {
		console.error(err);
		ctx.internalServerError("Internal server error");
	}
};

const updateUserApplication = async (ctx: Context) => {
	try {
		const userId = ctx.state.user.id;
		const { id } = ctx.params;
		const data = ctx.request.body;

		const existingApplication = await strapi
			.documents("api::loan-application.loan-application")
			.findFirst({ filters: { documentId: id, user: userId } });
		if (!existingApplication) {
			return ctx.notFound("Application not found");
		}

		const updatedApplication = await strapi
			.documents("api::loan-application.loan-application")
			.update({
				documentId: id,
				data: { user: userId, ...data },
				status: "published",
			});
		ctx.send(updatedApplication);
	} catch (error) {
		console.error(error);
		ctx.internalServerError("Internal server error");
	}
};

const getAllUserApplications = async (ctx: Context) => {
	try {
		const userId = ctx.state.user.id;
		const applications = await strapi
			.documents("api::loan-application.loan-application")
			.findMany({ filters: { user: userId } });
		ctx.send(applications);
	} catch (error) {
		console.error(error);
		ctx.internalServerError("Internal server error");
	}
};

export default {
	updateMe,
	createApplication,
	getUserApplication,
	updateUserApplication,
	getAllUserApplications,
};
