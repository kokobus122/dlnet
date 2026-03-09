import {
  pgTable,
  serial,
  text,
  timestamp,
  integer,
  foreignKey,
  index,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

import { user } from "../../drizzle/schema";

export const posts = pgTable(
  "posts",
  {
    id: serial().primaryKey(),
    authorId: text().notNull(),
    title: text().notNull(),
    content: text().notNull(),
    createdAt: timestamp("created_at").defaultNow(),
    locked: integer("locked").default(0),
  },
  (table) => [
    index("posts_authorId_idx").using(
      "btree",
      table.authorId.asc().nullsLast().op("text_ops"),
    ),
    foreignKey({
      columns: [table.authorId],
      foreignColumns: [user.id],
      name: "posts_authorId_fkey",
    }).onDelete("cascade"),
  ],
);

export type Post = typeof posts.$inferSelect;
export type NewPost = typeof posts.$inferInsert;

export const news = pgTable("news", {
  id: serial().primaryKey(),
  title: text().notNull(),
  content: text().notNull(),
  imageCover: text().notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export type News = typeof news.$inferSelect;
export type NewNews = typeof news.$inferInsert;

export const teams = pgTable("teams", {
  id: serial().primaryKey(),
  name: text().notNull(),
  country: text().notNull(),
  logo: text().notNull(),
});

export type Team = typeof teams.$inferSelect;
export type NewTeam = typeof teams.$inferInsert;

export const events = pgTable("events", {
  id: serial().primaryKey(),
  title: text().notNull(),
  logo: text().notNull(),
  prizePool: integer().notNull(),
  location: text().notNull(),
  startDate: timestamp("start_date").notNull(),
  endDate: timestamp("end_date").notNull(),
  description: text().notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export type Event = typeof events.$inferSelect;
export type NewEvent = typeof events.$inferInsert;

export const eventTeams = pgTable(
  "event_teams",
  {
    id: serial().primaryKey(),
    eventId: integer("event_id").notNull(),
    teamId: integer("team_id").notNull(),
    seed: integer("seed"),
    createdAt: timestamp("created_at").defaultNow(),
  },
  (table) => [
    index("event_teams_event_id_idx").using(
      "btree",
      table.eventId.asc().nullsLast().op("int4_ops"),
    ),
    index("event_teams_team_id_idx").using(
      "btree",
      table.teamId.asc().nullsLast().op("int4_ops"),
    ),
    foreignKey({
      columns: [table.eventId],
      foreignColumns: [events.id],
      name: "event_teams_event_id_fkey",
    }).onDelete("cascade"),
    foreignKey({
      columns: [table.teamId],
      foreignColumns: [teams.id],
      name: "event_teams_team_id_fkey",
    }).onDelete("cascade"),
  ],
);

export type EventTeam = typeof eventTeams.$inferSelect;
export type NewEventTeam = typeof eventTeams.$inferInsert;

export const matches = pgTable(
  "matches",
  {
    id: serial().primaryKey(),
    eventId: integer("event_id"),
    teamAId: integer("team_a_id").notNull(),
    teamBId: integer("team_b_id").notNull(),
    scoreA: integer().notNull(),
    scoreB: integer().notNull(),
    matchDate: timestamp("match_date").notNull(),
  },
  (table) => [
    index("matches_event_id_idx").using(
      "btree",
      table.eventId.asc().nullsLast().op("int4_ops"),
    ),
    index("matches_team_a_id_idx").using(
      "btree",
      table.teamAId.asc().nullsLast().op("int4_ops"),
    ),
    index("matches_team_b_id_idx").using(
      "btree",
      table.teamBId.asc().nullsLast().op("int4_ops"),
    ),
    foreignKey({
      columns: [table.teamAId],
      foreignColumns: [teams.id],
      name: "matches_team_a_id_fkey",
    }),
    foreignKey({
      columns: [table.eventId],
      foreignColumns: [events.id],
      name: "matches_event_id_fkey",
    }).onDelete("set null"),
    foreignKey({
      columns: [table.teamBId],
      foreignColumns: [teams.id],
      name: "matches_team_b_id_fkey",
    }),
  ],
);

export type Match = typeof matches.$inferSelect;
export type NewMatch = typeof matches.$inferInsert;

export const players = pgTable(
  "players",
  {
    id: serial().primaryKey(),
    name: text().notNull(),
    ingameName: text().notNull(),
    country: text().notNull(),
  },
  () => [],
);

export type Player = typeof players.$inferSelect;
export type NewPlayer = typeof players.$inferInsert;

export const playerTeamHistory = pgTable(
  "player_team_history",
  {
    id: serial().primaryKey(),
    playerId: integer("player_id").notNull(),
    teamId: integer("team_id").notNull(),
    joinedAt: timestamp("joined_at").defaultNow().notNull(),
    leftAt: timestamp("left_at"),
  },
  (table) => [
    index("player_team_history_player_id_idx").using(
      "btree",
      table.playerId.asc().nullsLast().op("int4_ops"),
    ),
    index("player_team_history_team_id_idx").using(
      "btree",
      table.teamId.asc().nullsLast().op("int4_ops"),
    ),
    foreignKey({
      columns: [table.playerId],
      foreignColumns: [players.id],
      name: "player_team_history_player_id_fkey",
    }).onDelete("cascade"),
    foreignKey({
      columns: [table.teamId],
      foreignColumns: [teams.id],
      name: "player_team_history_team_id_fkey",
    }).onDelete("cascade"),
  ],
);

export type PlayerTeamHistory = typeof playerTeamHistory.$inferSelect;
export type NewPlayerTeamHistory = typeof playerTeamHistory.$inferInsert;

export const comment = pgTable(
  "comments",
  {
    id: serial().primaryKey(),
    postId: integer("post_id"),
    newsId: integer("news_id"),
    matchId: integer("match_id"),
    parentCommentId: integer("parent_comment_id"),
    authorId: text().notNull(),
    content: text().notNull(),
    createdAt: timestamp("created_at").defaultNow(),
  },
  (table) => [
    index("comments_post_id_idx").using(
      "btree",
      table.postId.asc().nullsLast().op("int4_ops"),
    ),
    index("comments_news_id_idx").using(
      "btree",
      table.newsId.asc().nullsLast().op("int4_ops"),
    ),
    index("comments_match_id_idx").using(
      "btree",
      table.matchId.asc().nullsLast().op("int4_ops"),
    ),
    index("comments_parent_comment_id_idx").using(
      "btree",
      table.parentCommentId.asc().nullsLast().op("int4_ops"),
    ),
    index("comments_author_id_idx").using(
      "btree",
      table.authorId.asc().nullsLast().op("text_ops"),
    ),
    foreignKey({
      columns: [table.postId],
      foreignColumns: [posts.id],
      name: "comments_post_id_fkey",
    }).onDelete("cascade"),
    foreignKey({
      columns: [table.newsId],
      foreignColumns: [news.id],
      name: "comments_news_id_fkey",
    }).onDelete("cascade"),
    foreignKey({
      columns: [table.matchId],
      foreignColumns: [matches.id],
      name: "comments_match_id_fkey",
    }).onDelete("cascade"),
    foreignKey({
      columns: [table.parentCommentId],
      foreignColumns: [table.id],
      name: "comments_parent_comment_id_fkey",
    }).onDelete("cascade"),
    foreignKey({
      columns: [table.authorId],
      foreignColumns: [user.id],
      name: "comments_author_id_fkey",
    }).onDelete("cascade"),
  ],
);

export type Comment = typeof comment.$inferSelect;
export type NewComment = typeof comment.$inferInsert;

export type NewsWithComments = News & {
  comment: Comment[];
};

export type NewsWithOptionalComments = News & {
  comment?: Comment[];
};

export type MatchWithComments = Match & {
  comment: Comment[];
};

export type MatchWithOptionalComments = Match & {
  comment?: Comment[];
};

export const postsRelations = relations(posts, ({ many }) => ({
  comment: many(comment),
}));

export const newsRelations = relations(news, ({ many }) => ({
  comment: many(comment),
}));

export const matchesRelations = relations(matches, ({ one, many }) => ({
  comment: many(comment),
  event: one(events, {
    fields: [matches.eventId],
    references: [events.id],
  }),
  teamARef: one(teams, {
    fields: [matches.teamAId],
    references: [teams.id],
    relationName: "match_team_a",
  }),
  teamBRef: one(teams, {
    fields: [matches.teamBId],
    references: [teams.id],
    relationName: "match_team_b",
  }),
}));

export const teamsRelations = relations(teams, ({ many }) => ({
  playerHistory: many(playerTeamHistory),
  matchesAsTeamA: many(matches, {
    relationName: "match_team_a",
  }),
  matchesAsTeamB: many(matches, {
    relationName: "match_team_b",
  }),
  eventParticipations: many(eventTeams),
}));

export const eventsRelations = relations(events, ({ many }) => ({
  matches: many(matches),
  participatingTeams: many(eventTeams),
}));

export const eventTeamsRelations = relations(eventTeams, ({ one }) => ({
  event: one(events, {
    fields: [eventTeams.eventId],
    references: [events.id],
  }),
  team: one(teams, {
    fields: [eventTeams.teamId],
    references: [teams.id],
  }),
}));

export const playersRelations = relations(players, ({ many }) => ({
  teamHistory: many(playerTeamHistory),
}));

export const playerTeamHistoryRelations = relations(
  playerTeamHistory,
  ({ one }) => ({
    player: one(players, {
      fields: [playerTeamHistory.playerId],
      references: [players.id],
    }),
    team: one(teams, {
      fields: [playerTeamHistory.teamId],
      references: [teams.id],
    }),
  }),
);

export const commentRelations = relations(comment, ({ one, many }) => ({
  post: one(posts, {
    fields: [comment.postId],
    references: [posts.id],
  }),
  news: one(news, {
    fields: [comment.newsId],
    references: [news.id],
  }),
  match: one(matches, {
    fields: [comment.matchId],
    references: [matches.id],
  }),
  parent: one(comment, {
    fields: [comment.parentCommentId],
    references: [comment.id],
    relationName: "comment_replies",
  }),
  replies: many(comment, {
    relationName: "comment_replies",
  }),
}));
