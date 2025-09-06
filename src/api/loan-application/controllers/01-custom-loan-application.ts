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
			.findFirst({
				filters: { documentId: id, user: userId },
				populate: ["supportingDocuments", "supportingDocuments.file"],
			});
		if (!application) {
			return ctx.notFound("Application not found");
		}
		ctx.send(application);
	} catch (err) {
		console.error(err);
		ctx.internalServerError("Internal server error");
	}
};

// const updateUserApplication = async (ctx: Context) => {
// 	try {
// 		const userId = ctx.state.user.id;
// 		const { id } = ctx.params;
// 		const data = ctx.request.body;

// 		console.log(
// 			`Updsating application ${id} for user ${userId} with data:`,
// 			data
// 		);

// 		const existingApplication = await strapi
// 			.documents("api::loan-application.loan-application")
// 			.findFirst({
// 				filters: { documentId: id, user: userId },
// 				populate: ["supportingDocuments", "supportingDocuments.file"],
// 			});
// 		if (!existingApplication) {
// 			return ctx.notFound("Application not found");
// 		}

// 		// // delete existing supporting documents if new ones are provided. also delete the media files from the media library
// 		console.log({ existingApplication });
// 		if (data?.supportingDocuments?.length) {

// 			const newDocs = data.supportingDocuments
// 				.filter(
// 					(ed: any) =>
// 						!existingApplication.supportingDocuments.some(
// 							(nd: any) => nd.id === ed.id
// 						)
// 				)
// 				.map((nd: any) => ({
// 					file: nd.file,
// 					fileKey: nd.fileKey,
// 				}));

// 			console.log({ newDocs, incomingDocs: data.supportingDocuments });

// 		}

// 		const updatedApplication = await strapi
// 			.documents("api::loan-application.loan-application")
// 			.update({
// 				documentId: id,
// 				data: { user: userId, ...data },
// 				populate: ["supportingDocuments", "supportingDocuments.file"],
// 				status: "published",
// 			});
// 		ctx.send(updatedApplication);
// 	} catch (error) {
// 		console.error(error);
// 		ctx.internalServerError("Internal server error");
// 	}
// };

const updateUserApplication = async (ctx: Context) => {
	try {
		const userId = ctx.state.user.id;
		const { id } = ctx.params;
		const data = ctx.request.body;

		// console.log(
		// 	`Updating application ${id} for user ${userId} with data:`,
		// 	data
		// );

		const existingApplication = await strapi
			.documents("api::loan-application.loan-application")
			.findFirst({
				filters: { documentId: id, user: userId },
				populate: ["supportingDocuments", "supportingDocuments.file"],
			});

		if (!existingApplication) {
			return ctx.notFound("Application not found");
		}

		// Handle new supportingDocuments
		if (data?.supportingDocuments?.length) {
			// Map old docs by fileKey
			const existingByKey = Object.fromEntries(
				existingApplication.supportingDocuments.map((doc: any) => [
					doc.fileKey,
					doc,
				])
			);

			const newCleanDocs: any[] = [];
			const mediaToDelete: string[] = [];

			for (const newDoc of data.supportingDocuments) {
				const existingDoc = existingByKey[newDoc.fileKey];

				if (existingDoc) {
					// File was replaced → mark old media for deletion
					if (existingDoc.file?.id !== newDoc.file) {
						console.log({ existingDoc });
						mediaToDelete.push(existingDoc.file?.documentId);
					}

					// Overwrite existing → use its component ID
					console.log(`%c--> Preserving existing doc`, "color: orange", {
						id: existingDoc.id,
						file: newDoc.file,
						fileKey: newDoc.fileKey,
					});
					newCleanDocs.push({
						id: existingDoc.id,
						file: newDoc.file,
						fileKey: newDoc.fileKey,
					});
				} else {
					console.log(`%c--> Adding new doc`, "color: lightgreen", {
						__component: "files.supporting-document",
						file: newDoc.file,
						fileKey: newDoc.fileKey,
					});
					// It's a new doc → no ID, but include component reference
					newCleanDocs.push({
						__component: "files.supporting-document",
						file: newDoc.file,
						fileKey: newDoc.fileKey,
					});
				}
			}

			console.log({
				newCleanDocs,
				mediaToDelete,
				incomingDocs: data.supportingDocuments,
				existingByKey,
			});

			// Actually delete old media entries
			await Promise.all(
				mediaToDelete.map(async (mediaId) => {
					try {
						await strapi
							.documents("plugin::upload.file")
							.delete({ documentId: mediaId });
						console.log(`Deleted media with ID: ${mediaId}`);
					} catch (err) {
						console.warn(`Failed to delete media ${mediaId}:`, err);
					}
				})
			);

			// Replace in data
			// data.supportingDocuments = newCleanDocs;

			data.supportingDocuments = Object.values(
				data.supportingDocuments.reduce(
					(acc, curr) => {
						const key = curr.fileKey;
						if (!acc[key] || curr.file > acc[key].file) {
							acc[key] = curr;
						}
						return acc;
					},
					{} as Record<string, { fileKey: string; file: number; id?: number }>
				)
			);
		}

		console.log(
			`%c--> everything before has been done. Now we are finally updating the application`,
			"color: lightblue",
			{ id, data, newSupportingDocuments: data.supportingDocuments }
		);

		const updatedApplication = await strapi
			.documents("api::loan-application.loan-application")
			.update({
				documentId: id,
				data,
				populate: ["supportingDocuments", "supportingDocuments.file"],
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
			.findMany({
				filters: { user: userId },
				populate: ["supportingDocuments", "supportingDocuments.file"],
			});

		console.log({
			applications,
			supportingDocuments: applications.flatMap(
				(app) => app.supportingDocuments
			),
		});
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
