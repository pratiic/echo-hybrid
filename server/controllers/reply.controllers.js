export const replyToReview = async (request, response, next) => {
    const user = request.user;
    const reviewId = parseInt(request.params.reviewId);
    const { text } = request.body;
    let finalReply = null;

    // validate reply
    errorMsg = validateReply({ reviewId, text });

    if (errorMsg) {
        return next(new HttpError(errorMsg, 400));
    }

    const replyData = {
        text,
        userId: user.id,
        reviewId: reviewId,
    };

    try {
        const [createdReply, review] = await Promise.all([
            prisma.reply.create({
                data: replyData,
                include: {
                    user: true,
                },
            }),
            prisma.review.findUnique({
                where: {
                    id: reviewId,
                },
            }),
        ]);

        finalReply = createdReply;

        if (request.file) {
            // handle reply image
            const replyId = createdReply.id;
            const imageData = buildImage(request.file, replyId);

            const [, updatedReply] = await Promise.all([
                prisma.image.upsert({
                    where: { replyId },
                    update: imageData,
                    create: imageData,
                }),
                prisma.reply.update({
                    where: { id: replyId },
                    data: { image: imageData.src },
                    include: {
                        user: true,
                    },
                }),
            ]);

            finalReply = updatedReply;
        }

        io.emit("new-comment", {
            type: "reply",
            comment: finalReply,
            baseCommentId: reviewId,
            contentId: review.productId ? review.productId : review.shopId,
        });

        response.status(201).json({ reply: finalReply });
    } catch (error) {
        let msg, status;

        if (
            error.message
                .toLowerCase()
                .includes("foreign key constraint failed")
        ) {
            msg = "review not found";
            status = 404;
        }

        next(new HttpError(msg, status));
    }
};
