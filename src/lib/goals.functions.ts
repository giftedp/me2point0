import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export const getGoals = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    const { data, error } = await supabase
      .from("goals")
      .select("id, title, progress, is_active, created_at, updated_at")
      .eq("user_id", userId)
      .order("created_at", { ascending: true });
    if (error) throw new Error(error.message);
    return data ?? [];
  });

const CreateGoal = z.object({ title: z.string().min(1).max(300), progress: z.number().min(0).max(100).optional() });

export const createGoal = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => CreateGoal.parse(d))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const payload = { user_id: userId, title: data.title, progress: data.progress ?? 0, is_active: true };
    const { error } = await supabase.from("goals").insert(payload as never);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

const UpdateGoal = z.object({ id: z.string().uuid(), progress: z.number().min(0).max(100).optional(), is_active: z.boolean().optional(), title: z.string().max(300).optional() });

export const updateGoal = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => UpdateGoal.parse(d))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const patch: Record<string, unknown> = {};
    if (typeof data.progress === "number") patch.progress = data.progress;
    if (typeof data.is_active === "boolean") patch.is_active = data.is_active;
    if (typeof data.title === "string") patch.title = data.title;
    const { error } = await supabase.from("goals").update(patch as never).eq("id", data.id).eq("user_id", userId);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export default {};
