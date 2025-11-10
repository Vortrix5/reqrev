/**
 * Panel Manager
 * Handles panel visibility, tab state management, and enforcement
 */

import React from 'react';
import ReactDOM from 'react-dom/client';
import RequirementsPanel from '../components/RequirementsPanel';
import { IDS, CSS_CLASSES, TIMING } from '../constants';
import {
    getPanelContainer,
    getRequirementsTabLink,
    getAllNavTabs,
    resetTabState,
    setTabSelected,
    hideGitHubContent,
    showGitHubContent,
    getMainContent,
} from './githubDOM';

export class PanelManager {
    private repoId: string;
    private onToggle: () => void;
    private tabEnforcementInterval: number | null = null;
    private root: ReactDOM.Root | null = null;

    constructor(repoId: string, onToggle: () => void) {
        this.repoId = repoId;
        this.onToggle = onToggle;
    }

    /**
     * Create and mount the React panel
     */
    createPanel(): void {
        if (getPanelContainer()) {
            console.log('[ReqRev] Panel already exists');
            return;
        }

        console.log('[ReqRev] Creating panel for repo:', this.repoId);

        const container = document.createElement('turbo-frame');
        container.id = IDS.PANEL_CONTAINER;
        container.className = CSS_CLASSES.PANEL_HIDDEN;
        container.setAttribute('data-turbo-action', 'advance');

        const mainContent = getMainContent();
        if (mainContent) {
            mainContent.insertBefore(container, mainContent.firstChild);
        } else {
            document.body.appendChild(container);
        }

        this.root = ReactDOM.createRoot(container);
        this.root.render(
            <React.StrictMode>
                <RequirementsPanel repoId={this.repoId} onClose={this.toggle.bind(this)} />
            </React.StrictMode>
        );

        console.log('[ReqRev] Panel mounted successfully');
    }

    /**
     * Toggle panel visibility
     */
    toggle(): void {
        const container = getPanelContainer();

        if (!container) {
            this.createPanel();
            setTimeout(() => {
                const newContainer = getPanelContainer();
                if (newContainer) {
                    this.show();
                }
            }, TIMING.PANEL_CREATION_DELAY);
            return;
        }

        if (container.classList.contains(CSS_CLASSES.PANEL_HIDDEN)) {
            this.show();
        } else {
            this.hide();
        }
    }

    /**
     * Show the panel
     */
    private show(): void {
        const container = getPanelContainer();
        if (!container) return;

        container.classList.remove(CSS_CLASSES.PANEL_HIDDEN);
        container.classList.add(CSS_CLASSES.PANEL_VISIBLE);
        this.updateTabStates(true);
        this.startTabEnforcement();
    }

    /**
     * Hide the panel
     */
    private hide(): void {
        const container = getPanelContainer();
        if (!container) return;

        container.classList.remove(CSS_CLASSES.PANEL_VISIBLE);
        container.classList.add(CSS_CLASSES.PANEL_HIDDEN);
        this.updateTabStates(false);
        this.stopTabEnforcement();
    }

    /**
     * Update tab states based on panel visibility
     */
    private updateTabStates(isRequirementsActive: boolean): void {
        const reqrevTabLink = getRequirementsTabLink();
        
        if (reqrevTabLink) {
            setTabSelected(reqrevTabLink, isRequirementsActive);

            if (isRequirementsActive) {
                hideGitHubContent();
                this.deactivateAllGitHubTabs();
            } else {
                showGitHubContent();
            }
        }
    }

    /**
     * Deactivate all GitHub tabs
     */
    private deactivateAllGitHubTabs(): void {
        const reqrevTabLink = getRequirementsTabLink();
        const allTabs = getAllNavTabs();

        if (!allTabs) return;

        const resetTabs = () => {
            allTabs.forEach(tab => {
                if (tab !== reqrevTabLink) {
                    resetTabState(tab);
                }
            });
        };

        resetTabs();
        requestAnimationFrame(resetTabs);
        setTimeout(resetTabs, TIMING.TAB_RESET_DELAY);
    }

    /**
     * Start enforcing tab state
     */
    private startTabEnforcement(): void {
        this.stopTabEnforcement();
        this.enforceTabState();
        this.tabEnforcementInterval = window.setInterval(() => {
            this.enforceTabState();
        }, TIMING.TAB_ENFORCEMENT_INTERVAL);
    }

    /**
     * Stop enforcing tab state
     */
    private stopTabEnforcement(): void {
        if (this.tabEnforcementInterval !== null) {
            window.clearInterval(this.tabEnforcementInterval);
            this.tabEnforcementInterval = null;
        }
    }

    /**
     * Enforce that only Requirements tab is selected when panel is open
     */
    private enforceTabState(): void {
        const container = getPanelContainer();
        const reqrevTabLink = getRequirementsTabLink();

        if (container && reqrevTabLink && container.classList.contains(CSS_CLASSES.PANEL_VISIBLE)) {
            const allTabs = getAllNavTabs();
            
            if (allTabs) {
                allTabs.forEach(tab => {
                    if (tab !== reqrevTabLink) {
                        resetTabState(tab);
                    }
                });

                if (!reqrevTabLink.classList.contains(CSS_CLASSES.TAB_SELECTED)) {
                    setTabSelected(reqrevTabLink, true);
                }
            }
        }
    }

    /**
     * Watch GitHub tab changes and auto-close panel when another tab becomes active
     */
    watchGitHubTabs(): void {
        const allTabs = getAllNavTabs();
        if (!allTabs) return;

        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
                    const target = mutation.target as HTMLElement;

                    if (target.classList.contains(CSS_CLASSES.TAB_SELECTED) &&
                        target.getAttribute('data-tab-item') !== 'reqrev-requirements') {
                        this.handleGitHubTabClick();
                    }

                    this.handleOtherTabActivation(target);
                }
            });
        });

        allTabs.forEach(tab => {
            observer.observe(tab, {
                attributes: true,
                attributeFilter: ['class', 'aria-selected', 'aria-current']
            });
        });

        console.log('[ReqRev] Watching GitHub tabs for changes');
    }

    /**
     * Handle when a GitHub tab is clicked
     */
    private handleGitHubTabClick(): void {
        const container = getPanelContainer();
        if (container && container.classList.contains(CSS_CLASSES.PANEL_VISIBLE)) {
            this.hide();
        }
    }

    /**
     * Handle when another tab tries to become active while Requirements is active
     */
    private handleOtherTabActivation(target: HTMLElement): void {
        const reqrevTabLink = getRequirementsTabLink();
        const container = getPanelContainer();
        
        if (reqrevTabLink &&
            container &&
            container.classList.contains(CSS_CLASSES.PANEL_VISIBLE) &&
            target !== reqrevTabLink &&
            target.classList.contains(CSS_CLASSES.TAB_SELECTED)) {
            resetTabState(target);
        }
    }

    /**
     * Remove the panel from DOM
     */
    remove(): void {
        this.stopTabEnforcement();
        const container = getPanelContainer();
        if (container) {
            container.remove();
        }
        this.root = null;
    }
}
