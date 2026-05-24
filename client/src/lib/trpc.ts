import { createTRPCReact } from "@trpc/react-query";
import type { AppRouter } from "../../../server/src/routes/routers";

export const trpc = createTRPCReact<AppRouter>();
