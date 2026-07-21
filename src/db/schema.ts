import { i } from '@instantdb/react';

const schema = i.schema({
  entities: {
    reactions: i.entity({
      imageId: i.string(),
      emoji: i.string(),
      username: i.string(),
      userColor: i.string(),
      createdAt: i.number(),
      // Embedded image metadata for global feed previews and instant modal focusing
      imageThumb: i.string().optional(),
      imageUrl: i.string().optional(),
      imageAuthor: i.string().optional(),
      imageDesc: i.string().optional(),
    }),
    comments: i.entity({
      imageId: i.string(),
      text: i.string(),
      username: i.string(),
      userColor: i.string(),
      createdAt: i.number(),
      // Embedded image metadata
      imageThumb: i.string().optional(),
      imageUrl: i.string().optional(),
      imageAuthor: i.string().optional(),
      imageDesc: i.string().optional(),
    }),
  },
  links: {},
  rooms: {},
});

export type AppSchema = typeof schema;
export default schema;
