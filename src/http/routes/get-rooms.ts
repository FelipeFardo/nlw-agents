import { count, eq } from 'drizzle-orm'
import type { FastifyPluginCallbackZod } from 'fastify-type-provider-zod'
import z from 'zod/v4'
import { db } from '../../db/connection.ts'
import { schema } from '../../db/schema/index.ts'
import { questions } from '../../db/schema/questions.ts'

export const getRoomsRoute: FastifyPluginCallbackZod = (app) => {
  app.get(
    '/rooms',
    {
      schema: {
        tags: ['rooms'],
        summary: 'Get rooms',
        response: {
          200: z.object({
            rooms: z.array(
              z.object({
                id: z.string(),
                name: z.string(),
                createdAt: z.date(),
                questionsCount: z.number().int(),
              })
            ),
          }),
        },
      },
    },
    async () => {
      const results = await db
        .select({
          id: schema.rooms.id,
          name: schema.rooms.name,
          questionsCount: count(questions.id),
          createdAt: schema.rooms.createdAt,
        })
        .from(schema.rooms)
        .leftJoin(
          schema.questions,
          eq(schema.questions.roomId, schema.rooms.id)
        )
        .groupBy(schema.rooms.id)
        .orderBy(schema.rooms.createdAt)

      return { rooms: results }
    }
  )
}
