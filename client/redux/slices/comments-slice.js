import { createSlice } from "@reduxjs/toolkit";

export const commentsSlice = createSlice({
  name: "comments",
  initialState: {
    reviews: [],
    needToFetchReviews: true,
    replies: {},
    activeComment: null,
  },
  reducers: {
    setComments: (state, action) => {
      const { comments, type, baseCommentId } = action.payload;

      if (type === "review") {
        state.reviews = comments;
        state.needToFetchReviews = true;
      } else {
        state.replies[baseCommentId] = comments;
      }
    },
    addComment: (state, action) => {
      const { comment, type, baseCommentId } = action.payload;

      if (type === "review") {
        if (state.reviews.find((review) => review.id === comment.id)) {
          return;
        }

        state.reviews = [comment, ...state.reviews];
      } else {
        if (
          state.replies[baseCommentId?.find((reply) => reply.id === comment.id)]
        ) {
          return;
        }

        if (state.replies[baseCommentId]) {
          state.replies[baseCommentId] = {
            comment,
            ...state.replies[baseCommentId],
          };
        } else {
          state.replies[baseCommentId] = [comment];
        }
      }
    },
    updateComment: (state, action) => {
      const { commentId, type, baseCommentId, updateInfo } = action.payload;

      if (type === "review") {
        state.reviews = state.reviews.map((review) => {
          if (review.id === commentId) {
            return { ...review, ...updateInfo };
          }

          return review;
        });
      } else {
        state.replies[baseCommentId] = state.replies[baseCommentId].map(
          (reply) => {
            if (reply.id === commentId) {
              return { ...reply, ...updateInfo };
            }

            return reply;
          }
        );
      }
    },
    deleteComment: (state, action) => {
      const { type, id, baseCommentId } = action.payload;

      if (type === "review") {
        state.reviews = state.reviews.filter((review) => review.id !== id);
      } else {
        state.replies[baseCommentId] = state.replies[baseCommentId].filter(
          (reply) => reply.id !== id
        );
      }
    },
    setActiveComment: (state, action) => {
      state.activeComment = action.payload;
    },
  },
});

export const {
  setComments,
  addComment,
  updateComment,
  deleteComment,
  setActiveComment,
} = commentsSlice.actions;
export default commentsSlice.reducer;
