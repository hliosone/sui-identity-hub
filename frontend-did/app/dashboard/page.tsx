"use client";

import { DIDManagement } from "@/components/DIDManagement";
import { DIDObject } from "@/utils/interfaces";

export default function DashboardPage() {
    return (
        <DIDManagement userDID={null} setUserDID={function (did: DIDObject | null): void {
            throw new Error("Function not implemented.");
        } } />
    );
    }