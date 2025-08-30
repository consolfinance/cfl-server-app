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
export default { updateMe };
