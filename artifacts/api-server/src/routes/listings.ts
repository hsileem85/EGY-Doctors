import { Router, type IRouter } from "express";
import { eq, and } from "drizzle-orm";
import { z } from "zod";
import { db, specialtiesTable, servicesTable, citiesTable, areasTable } from "@workspace/db";

const router: IRouter = Router();

/* ─── GET /specialties ─── */
router.get("/specialties", async (_req, res): Promise<void> => {
  const rows = await db.select({
    id: specialtiesTable.id,
    name: specialtiesTable.name,
    nameAr: specialtiesTable.nameAr,
    displayOrder: specialtiesTable.displayOrder,
  }).from(specialtiesTable)
    .where(eq(specialtiesTable.isActive, "true"))
    .orderBy(specialtiesTable.displayOrder);

  res.json(rows);
});

/* ─── GET /services ─── */
router.get("/services", async (_req, res): Promise<void> => {
  const rows = await db.select({
    id: servicesTable.id,
    name: servicesTable.name,
    nameAr: servicesTable.nameAr,
    displayOrder: servicesTable.displayOrder,
  }).from(servicesTable)
    .where(eq(servicesTable.isActive, "true"))
    .orderBy(servicesTable.displayOrder);

  res.json(rows);
});

/* ─── GET /cities ─── */
router.get("/cities", async (_req, res): Promise<void> => {
  const rows = await db.select({
    id: citiesTable.id,
    name: citiesTable.name,
    nameAr: citiesTable.nameAr,
    displayOrder: citiesTable.displayOrder,
  }).from(citiesTable)
    .where(eq(citiesTable.isActive, "true"))
    .orderBy(citiesTable.displayOrder);

  res.json(rows);
});

/* ─── GET /areas ─── */
router.get("/areas", async (req, res): Promise<void> => {
  const Schema = z.object({ cityId: z.coerce.number().optional() });
  const params = Schema.safeParse(req.query);
  const cityId = params.success ? params.data.cityId : undefined;

  const rows = cityId != null
    ? await db.select({
        id: areasTable.id,
        cityId: areasTable.cityId,
        name: areasTable.name,
        nameAr: areasTable.nameAr,
        displayOrder: areasTable.displayOrder,
      }).from(areasTable)
        .where(and(eq(areasTable.isActive, "true"), eq(areasTable.cityId, cityId)))
        .orderBy(areasTable.displayOrder)
    : await db.select({
        id: areasTable.id,
        cityId: areasTable.cityId,
        name: areasTable.name,
        nameAr: areasTable.nameAr,
        displayOrder: areasTable.displayOrder,
      }).from(areasTable)
        .where(eq(areasTable.isActive, "true"))
        .orderBy(areasTable.displayOrder);

  res.json(rows);
});

export default router;
