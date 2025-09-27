"use client";

import {
    DynamicContextProvider,
} from "@dynamic-labs/sdk-react-core";

import { SuiWalletConnectors } from "@dynamic-labs/sui";

export const sidebarCss = `
    @media (min-width: 768px) {
        .accordion-item {
        max-height: 100vh !important;
        }

        .modal, .dynamic-widget-modal, .dynamic-widget-card {
        right: 0 !important;
        top: 0 !important;
        transform: none !important;
        height: 100vh !important;
        border-radius: 0 !important;
        left: auto !important;
        }

        .wallet-list__scroll-container {
        max-height: 80vh !important;
        }

        .settings-view__body {
        height: auto !important;
        }

        .modal-card, .dynamic-widget-card {
        border-radius: 0 !important;
        background: linear-gradient(to bottom, #e6f3ff, #ffffff) !important;
        }

        .social-redirect-view__container, .wallet-no-access__container, .pending-signature__container, .pending-connect__container {
        display: flex;
        align-items: center;
        justify-content: center;
        height: 100vh;
        margin-top: -15%;
        }

        .footer-options-switcher__container {
        border-radius: 0 !important;
        position: absolute !important;
        bottom: 0 !important;
        left: 0 !important;
        right: 0 !important;
        }

        .dynamic-user-profile-layout {
        height: 90vh !important;
        }

        .dynamic-footer, .tos-and-pp__footer {
        position: fixed !important;
        bottom: 0 !important;
        left: 0 !important;
        right: 0 !important;
        }

        .tos-and-pp__footer {
        bottom: 30px !important;
        }
    }`;


export default function DynamicWalletProviderWrapper({ children }: Readonly<{ children: React.ReactNode }>) {
        
    return (
        <DynamicContextProvider
            settings={{
                environmentId: process.env.NEXT_PUBLIC_DYNAMIC_ENV_ID || "",
                walletConnectors: [SuiWalletConnectors],
                cssOverrides: sidebarCss,
                events: {
                    onAuthSuccess: () => {
                        window.location.href = "/dashboard";
                    },
                    onLogout: () => {
                        window.location.href = "/";
                    }
                },
            }}
        >
        {/* <DynamicWidget /> */}
        {children}
        </DynamicContextProvider>
    );
}
