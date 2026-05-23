import type { Iuser } from "./auth.interface";
export declare const authService: {
    loginIntoDB: (payload: Iuser) => Promise<{
        token: string;
        user: any;
    }>;
};
//# sourceMappingURL=auth.service.d.ts.map