import { pgTable, serial, text, timestamp, varchar } from "drizzle-orm/pg-core";

export const tracks = pgTable("tracks", {
    id: serial("id").primaryKey(),
    songName: varchar("songName", { length: 255 }).notNull(),
    artist: varchar("artist", { length: 255 }).notNull(),
    style: varchar("style", { length: 255 }).notNull(),
    version: varchar("version", { length: 255 }),
    imageUrl: text("imageUrl").notNull(),
    previewUrl: text("previewUrl").notNull(),
    downloadUrl: text("downloadUrl").notNull(),
    releaseDate: timestamp("releaseDate", { withTimezone: true }).notNull(),
    createdAt: timestamp("createdAt", { withTimezone: true }).defaultNow(),
    updatedAt: timestamp("updatedAt", { withTimezone: true }).defaultNow(),
});
