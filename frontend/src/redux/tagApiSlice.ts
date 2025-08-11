import { z } from "zod";
import { type Tag, tagSchema } from "@/schemas/tag";
import { apiSlice } from "./apiSlice.ts";

const tagApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getTags: builder.query<Tag[], void>({
      query: () => ({
        url: "/tags",
        method: "GET",
      }),
      responseSchema: z.array(tagSchema),
      providesTags: ["Tags"],
    }),
    //TODO: optimistic update also return the id in the endpoint
    addTag: builder.mutation<void, Omit<Tag, "id">>({
      query: (tagPayLoad) => ({
        url: "/tags",
        method: "PUT",
        body: tagPayLoad,
      }),
      invalidatesTags: ["Tags"],
    }),
    //TODO: optimistic update
    modifyTag: builder.mutation<
      void,
      { tagPayload: Omit<Tag, "id">; id: string }
    >({
      query: ({ tagPayload, id }) => ({
        url: `/tags/${id}`,
        method: "PATCH",
        body: tagPayload,
      }),
      invalidatesTags: ["Tags"],
    }),
  }),
  overrideExisting: false,
});

export const { useGetTagsQuery, useAddTagMutation, useModifyTagMutation } =
  tagApiSlice;
