import { relations } from "drizzle-orm";
import {
  pgTable,
  text,
  varchar,
  uuid,
  timestamp,
  integer,
  boolean,
} from "drizzle-orm/pg-core";

//Tabela de usuários do Supabase
export const profiles = pgTable("profiles", {
  id: uuid("id").primaryKey(),
  email: text("email").notNull(),
  name: text("name").notNull(),
  phone: varchar("phone", { length: 256 }).notNull(),
  role: text("role").notNull().default("user"),
  status: text("status").notNull().default("active"),
  profile_picture: text("profile_picture"),
  enterprise_id: uuid("enterprise_id")
    .references(() => enterprises.id)
    .notNull(),
  created_at: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updated_at: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

//Tabela de empresas
export const enterprises = pgTable("enterprises", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull(),
  cep: text("cep").notNull(),
  address: text("address").notNull(),
  number: text("number").notNull(),
  complement: text("complement"),
  city: text("city").notNull(),
  state: text("state").notNull(),
  instagram_url: text("instagram_url"),
  phoneNumber: text("phone_number").notNull(),
  register: text("register").notNull(),
  created_at: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updated_at: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

//Relação entre empresas e perfis (1:N)
export const enterpriseProfileRelation = relations(enterprises, ({ many }) => ({
  profiles: many(profiles),
}));

//Tabela de projetos
export const projects = pgTable("projects", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull(),
  logo_url: text("logo_url"),
  status: text("status").notNull().default("active"), // active, inactive
  category: text("category").notNull(), // microsaas, ecommerce, crm, others
  slug: text("slug").notNull(),
  enterprise_id: uuid("enterprise_id")
    .references(() => enterprises.id)
    .notNull(),
  created_at: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updated_at: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

//Relação entre projetos e empresas (1:N)
export const projectEnterpriseRelation = relations(projects, ({ one }) => ({
  enterprise: one(enterprises, {
    fields: [projects.enterprise_id],
    references: [enterprises.id],
  }),
}));

// Tabela de bots WhatsApp
export const whatsappBots = pgTable("whatsapp_bots", {
  id: uuid("id").defaultRandom().primaryKey(),
  project_id: uuid("project_id")
    .references(() => projects.id, { onDelete: "cascade" })
    .notNull()
    .unique(),
  instance_id: text("instance_id").notNull(),
  api_token: text("api_token").notNull(),
  webhook_url: text("webhook_url"),
  status: text("status").notNull().default("inactive"), // active, inactive
  created_at: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updated_at: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

// Tabela de contatos WhatsApp
export const whatsappContacts = pgTable("whatsapp_contacts", {
  id: uuid("id").defaultRandom().primaryKey(),
  bot_id: uuid("bot_id")
    .references(() => whatsappBots.id, { onDelete: "cascade" })
    .notNull(),
  phone: text("phone").notNull(),
  name: text("name"),
  last_interaction_at: timestamp("last_interaction_at", { withTimezone: true }),
  created_at: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updated_at: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

// Tabela de mensagens WhatsApp
export const whatsappMessages = pgTable("whatsapp_messages", {
  id: uuid("id").defaultRandom().primaryKey(),
  bot_id: uuid("bot_id")
    .references(() => whatsappBots.id, { onDelete: "cascade" })
    .notNull(),
  contact_id: uuid("contact_id").references(() => whatsappContacts.id, {
    onDelete: "set null",
  }),
  phone: text("phone").notNull(),
  message_id: text("message_id"), // ID da mensagem do Z-API
  direction: text("direction").notNull(), // incoming, outgoing
  message_text: text("message_text").notNull(),
  message_type: text("message_type").notNull().default("text"), // text, menu, flow
  created_at: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

// Tabela de respostas do bot
export const whatsappResponses = pgTable("whatsapp_responses", {
  id: uuid("id").defaultRandom().primaryKey(),
  bot_id: uuid("bot_id")
    .references(() => whatsappBots.id, { onDelete: "cascade" })
    .notNull(),
  response_text: text("response_text"),
  response_type: text("response_type").notNull().default("text"), // text, menu, flow
  menu_id: uuid("menu_id").references(() => whatsappMenus.id, {
    onDelete: "set null",
  }),
  created_at: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updated_at: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

// Tabela de gatilhos (triggers)
export const whatsappTriggers = pgTable("whatsapp_triggers", {
  id: uuid("id").defaultRandom().primaryKey(),
  bot_id: uuid("bot_id")
    .references(() => whatsappBots.id, { onDelete: "cascade" })
    .notNull(),
  trigger_text: text("trigger_text").notNull(),
  match_type: text("match_type").notNull().default("exact"), // exact, contains, starts_with, regex
  priority: integer("priority").notNull().default(0), // menor = maior prioridade
  response_id: uuid("response_id")
    .references(() => whatsappResponses.id, { onDelete: "cascade" })
    .notNull(),
  is_active: boolean("is_active").notNull().default(true),
  created_at: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updated_at: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

// Tabela de menus
export const whatsappMenus = pgTable("whatsapp_menus", {
  id: uuid("id").defaultRandom().primaryKey(),
  bot_id: uuid("bot_id")
    .references(() => whatsappBots.id, { onDelete: "cascade" })
    .notNull(),
  title: text("title").notNull(),
  description: text("description"),
  created_at: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updated_at: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

// Tabela de opções do menu
export const whatsappMenuOptions = pgTable("whatsapp_menu_options", {
  id: uuid("id").defaultRandom().primaryKey(),
  menu_id: uuid("menu_id")
    .references(() => whatsappMenus.id, { onDelete: "cascade" })
    .notNull(),
  option_text: text("option_text").notNull(),
  option_value: text("option_value"),
  response_id: uuid("response_id").references(() => whatsappResponses.id, {
    onDelete: "set null",
  }),
  order: integer("order").notNull().default(0),
  created_at: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updated_at: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

// Relações WhatsApp
export const whatsappBotProjectRelation = relations(
  whatsappBots,
  ({ one }) => ({
    project: one(projects, {
      fields: [whatsappBots.project_id],
      references: [projects.id],
    }),
  })
);

export const whatsappBotContactsRelation = relations(
  whatsappBots,
  ({ many }) => ({
    contacts: many(whatsappContacts),
  })
);

export const whatsappBotMessagesRelation = relations(
  whatsappBots,
  ({ many }) => ({
    messages: many(whatsappMessages),
  })
);

export const whatsappBotResponsesRelation = relations(
  whatsappBots,
  ({ many }) => ({
    responses: many(whatsappResponses),
  })
);

export const whatsappBotTriggersRelation = relations(
  whatsappBots,
  ({ many }) => ({
    triggers: many(whatsappTriggers),
  })
);

export const whatsappBotMenusRelation = relations(whatsappBots, ({ many }) => ({
  menus: many(whatsappMenus),
}));

export const whatsappContactMessagesRelation = relations(
  whatsappContacts,
  ({ many }) => ({
    messages: many(whatsappMessages),
  })
);

export const whatsappContactBotRelation = relations(
  whatsappContacts,
  ({ one }) => ({
    bot: one(whatsappBots, {
      fields: [whatsappContacts.bot_id],
      references: [whatsappBots.id],
    }),
  })
);

export const whatsappMessageBotRelation = relations(
  whatsappMessages,
  ({ one }) => ({
    bot: one(whatsappBots, {
      fields: [whatsappMessages.bot_id],
      references: [whatsappBots.id],
    }),
  })
);

export const whatsappMessageContactRelation = relations(
  whatsappMessages,
  ({ one }) => ({
    contact: one(whatsappContacts, {
      fields: [whatsappMessages.contact_id],
      references: [whatsappContacts.id],
    }),
  })
);

export const whatsappResponseBotRelation = relations(
  whatsappResponses,
  ({ one }) => ({
    bot: one(whatsappBots, {
      fields: [whatsappResponses.bot_id],
      references: [whatsappBots.id],
    }),
  })
);

export const whatsappResponseMenuRelation = relations(
  whatsappResponses,
  ({ one }) => ({
    menu: one(whatsappMenus, {
      fields: [whatsappResponses.menu_id],
      references: [whatsappMenus.id],
    }),
  })
);

export const whatsappTriggerBotRelation = relations(
  whatsappTriggers,
  ({ one }) => ({
    bot: one(whatsappBots, {
      fields: [whatsappTriggers.bot_id],
      references: [whatsappBots.id],
    }),
  })
);

export const whatsappTriggerResponseRelation = relations(
  whatsappTriggers,
  ({ one }) => ({
    response: one(whatsappResponses, {
      fields: [whatsappTriggers.response_id],
      references: [whatsappResponses.id],
    }),
  })
);

export const whatsappMenuBotRelation = relations(whatsappMenus, ({ one }) => ({
  bot: one(whatsappBots, {
    fields: [whatsappMenus.bot_id],
    references: [whatsappBots.id],
  }),
}));

export const whatsappMenuOptionsRelation = relations(
  whatsappMenus,
  ({ many }) => ({
    options: many(whatsappMenuOptions),
  })
);

export const whatsappMenuOptionMenuRelation = relations(
  whatsappMenuOptions,
  ({ one }) => ({
    menu: one(whatsappMenus, {
      fields: [whatsappMenuOptions.menu_id],
      references: [whatsappMenus.id],
    }),
  })
);

export const whatsappMenuOptionResponseRelation = relations(
  whatsappMenuOptions,
  ({ one }) => ({
    response: one(whatsappResponses, {
      fields: [whatsappMenuOptions.response_id],
      references: [whatsappResponses.id],
    }),
  })
);
