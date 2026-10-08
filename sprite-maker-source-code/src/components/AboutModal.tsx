import React, { useState, useEffect } from 'react';
import { 
  X, 
  ExternalLink, 
  Heart, 
  Github,
  Palette
} from 'lucide-react';
import { getAssetUrl } from '../utils/assetUrl';

interface AboutModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type AboutTab = 'specs' | 'credits' | 'legal';

export const AboutModal: React.FC<AboutModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<AboutTab>('specs');

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const apacheLicenseNotice = `Copyright 2026 Ceqell

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.`;

  const apacheLicenseText = `
                                 Apache License
                           Version 2.0, January 2004
                        http://www.apache.org/licenses/

   TERMS AND CONDITIONS FOR USE, REPRODUCTION, AND DISTRIBUTION

   1. Definitions.

      "License" shall mean the terms and conditions for use, reproduction,
      and distribution as defined by Sections 1 through 9 of this document.

      "Licensor" shall mean the copyright owner or entity authorized by
      the copyright owner that is granting the License.

      "Legal Entity" shall mean the union of the acting entity and all
      other entities that control, are controlled by, or are under common
      control with that entity. For the purposes of this definition,
      "control" means (i) the power, direct or indirect, to cause the
      direction or management of such entity, whether by contract or
      otherwise, or (ii) ownership of fifty percent (50%) or more of the
      outstanding shares, or (iii) beneficial ownership of such entity.

      "You" (or "Your") shall mean an individual or Legal Entity
      exercising permissions granted by this License.

      "Source" form shall mean the preferred form for making modifications,
      including but not limited to software source code, documentation
      source, and configuration files.

      "Object" form shall mean any form resulting from mechanical
      transformation or translation of a Source form, including but
      not limited to compiled object code, generated documentation,
      and conversions to other media types.

      "Work" shall mean the work of authorship, whether in Source or
      Object form, made available under the License, as indicated by a
      copyright notice that is included in or attached to the work
      (an example is provided in the Appendix below).

      "Derivative Works" shall mean any work, whether in Source or Object
      form, that is based on (or derived from) the Work and for which the
      editorial revisions, annotations, elaborations, or other modifications
      represent, as a whole, an original work of authorship. For the purposes
      of this License, Derivative Works shall not include works that remain
      separable from, or merely link (or bind by name) to the interfaces of,
      the Work and Derivative Works thereof.

      "Contribution" shall mean any work of authorship, including
      the original version of the Work and any modifications or additions
      to that Work or Derivative Works thereof, that is intentionally
      submitted to Licensor for inclusion in the Work by the copyright owner
      or by an individual or Legal Entity authorized to submit on behalf of
      the copyright owner. For the purposes of this definition, "submitted"
      means any form of electronic, verbal, or written communication sent
      to the Licensor or its representatives, including but not limited to
      communication on electronic mailing lists, source code control systems,
      and issue tracking systems that are managed by, or on behalf of, the
      Licensor for the purpose of discussing and improving the Work, but
      excluding communication that is conspicuously marked or otherwise
      designated in writing by the copyright owner as "Not a Contribution."

      "Contributor" shall mean Licensor and any individual or Legal Entity
      on behalf of whom a Contribution has been received by Licensor and
      subsequently incorporated within the Work.

   2. Grant of Copyright License. Subject to the terms and conditions of
      this License, each Contributor hereby grants to You a perpetual,
      worldwide, non-exclusive, no-charge, royalty-free, irrevocable
      copyright license to reproduce, prepare Derivative Works of,
      publicly display, publicly perform, sublicense, and distribute the
      Work and such Derivative Works in Source or Object form.

   3. Grant of Patent License. Subject to the terms and conditions of
      this License, each Contributor hereby grants to You a perpetual,
      worldwide, non-exclusive, no-charge, royalty-free, irrevocable
      (except as stated in this section) patent license to make, have made,
      use, offer to sell, sell, import, and otherwise transfer the Work,
      where such license applies only to those patent claims licensable
      by such Contributor that are necessarily infringed by their
      Contribution(s) alone or by combination of their Contribution(s)
      with the Work to which such Contribution(s) was submitted. If You
      institute patent litigation against any entity (including a
      cross-claim or counterclaim in a lawsuit) alleging that the Work
      or a Contribution incorporated within the Work constitutes direct
      or contributory patent infringement, then any patent licenses
      granted to You under this License for that Work shall terminate
      as of the date such litigation is filed.

   4. Redistribution. You may reproduce and distribute copies of the
      Work or Derivative Works thereof in any medium, with or without
      modifications, and in Source or Object form, provided that You
      meet the following conditions:

      (a) You must give any other recipients of the Work or
          Derivative Works a copy of this License; and

      (b) You must cause any modified files to carry prominent notices
          stating that You changed the files; and

      (c) You must retain, in the Source form of any Derivative Works
          that You distribute, all copyright, patent, trademark, and
          attribution notices from the Source form of the Work,
          excluding those notices that do not pertain to any part of
          the Derivative Works; and

      (d) If the Work includes a "NOTICE" text file as part of its
          distribution, then any Derivative Works that You distribute must
          include a readable copy of the attribution notices contained
          within such NOTICE file, excluding those notices that do not
          pertain to any part of the Derivative Works, in at least one
          of the following places: within a NOTICE text file distributed
          as part of the Derivative Works; within the Source form or
          documentation, if provided along with the Derivative Works; or,
          within a display generated by the Derivative Works, if and
          wherever such third-party notices normally appear. The contents
          of the NOTICE file are for informational purposes only and
          do not modify the License. You may add Your own attribution
          notices within Derivative Works that You distribute, alongside
          or as an addendum to the NOTICE text from the Work, provided
          that such additional attribution notices cannot be construed
          as modifying the License.

      You may add Your own copyright statement to Your modifications and
      may provide additional or different license terms and conditions
      for use, reproduction, or distribution of Your modifications, or
      for any such Derivative Works as a whole, provided Your use,
      reproduction, and distribution of the Work otherwise complies with
      the conditions stated in this License.

   5. Submission of Contributions. Unless You explicitly state otherwise,
      any Contribution intentionally submitted for inclusion in the Work
      by You to the Licensor shall be under the terms and conditions of
      this License, without any additional terms or conditions.
      Notwithstanding the above, nothing herein shall supersede or modify
      the terms of any separate license agreement you may have executed
      with Licensor regarding such Contributions.

   6. Trademarks. This License does not grant permission to use the trade
      names, trademarks, service marks, or product names of the Licensor,
      except as required for reasonable and customary use in describing the
      origin of the Work and reproducing the content of the NOTICE file.

   7. Disclaimer of Warranty. Unless required by applicable law or
      agreed to in writing, Licensor provides the Work (and each
      Contributor provides its Contributions) on an "AS IS" BASIS,
      WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or
      implied, including, without limitation, any warranties or conditions
      of TITLE, NON-INFRINGEMENT, MERCHANTABILITY, or FITNESS FOR A
      PARTICULAR PURPOSE. You are solely responsible for determining the
      appropriateness of using or redistributing the Work and assume any
      risks associated with Your exercise of permissions under this License.

   8. Limitation of Liability. In no event and under no legal theory,
      whether in tort (including negligence), contract, or otherwise,
      unless required by applicable law (such as deliberate and grossly
      negligent acts) or agreed to in writing, shall any Contributor be
      liable to You for damages, including any direct, indirect, special,
      incidental, or consequential damages of any character arising as a
      result of this License or out of the use or inability to use the
      Work (including but not limited to damages for loss of goodwill,
      work stoppage, computer failure or malfunction, or any and all
      other commercial damages or losses), even if such Contributor
      has been advised of the possibility of such damages.

   9. Accepting Warranty or Additional Liability. While redistributing
      the Work or Derivative Works thereof, You may choose to offer,
      and charge a fee for, acceptance of support, warranty, indemnity,
      or other liability obligations and/or rights consistent with this
      License. However, in accepting such obligations, You may act only
      on Your own behalf and on Your sole responsibility, not on behalf
      of any other Contributor, and only if You agree to indemnify,
      defend, and hold each Contributor harmless for any liability
      incurred by, or claims asserted against, such Contributor by reason
      of your accepting any such warranty or additional liability.

   END OF TERMS AND CONDITIONS`

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150"
      onClick={onClose}
    >
      {/* macOS Style Window Dialog */}
      <div 
        onClick={(e) => e.stopPropagation()}
        className="w-[500px] max-w-[95vw] bg-surface-theme border border-ui-theme rounded-xl shadow-2xl overflow-hidden flex flex-col text-primary-theme transition-all duration-200 select-text"
        style={{
          boxShadow: '0 20px 40px -10px rgba(0, 0, 0, 0.6), 0 0 0 1px var(--border-ui)'
        }}
      >
        {/* Title Bar with Glossy macOS Close Button */}
        <div className="relative flex items-center justify-between px-3 py-2 bg-surface-raised-theme border-b border-ui-theme">
          {/* Glossy Aqua Close Button (pure lighter gradient) */}
          <div className="flex items-center z-10">
            <button
              onClick={onClose}
              className="relative w-3.5 h-3.5 rounded-full flex items-center justify-center group cursor-pointer transition-all active:scale-95 overflow-hidden"
              style={{
                background: 'linear-gradient(180deg, #ff8579 0%, #ff5e50 50%, #f63c2e 100%)',
                border: '1px solid #b81e16',
                boxShadow: 'inset 0 1px 1px rgba(255, 255, 255, 0.9), inset 0 -1px 2px rgba(200, 30, 20, 0.35), 0 1px 2px rgba(0, 0, 0, 0.35)'
              }}
              title="Close window"
              aria-label="Close"
            >
              {/* Upper Aqua gel highlight */}
              <span 
                className="pointer-events-none absolute top-[1px] inset-x-[2px] h-[38%] rounded-full opacity-95"
                style={{
                  background: 'linear-gradient(180deg, rgba(255, 255, 255, 0.95) 0%, rgba(255, 255, 255, 0.2) 100%)'
                }}
              />
              <X className="relative z-10 w-2 h-2 text-[#350200] opacity-0 group-hover:opacity-100 transition-opacity stroke-[3]" />
            </button>
          </div>

          {/* Centered Window Title */}
          <span className="absolute inset-x-0 text-center text-xs font-semibold text-primary-theme select-text">
            About FigurayMaker
          </span>

          <div className="w-4" />
        </div>

        {/* Window Content Body */}
        <div className="p-5 flex flex-col items-center max-h-[85vh] overflow-y-auto no-scrollbar select-text">
          {/* App Logo / Emblem */}
          <div className="relative mb-2 flex items-center justify-center">
            <img 
              src={getAssetUrl('FigurayMakerBanner4.png')} 
              alt="FigurayMaker Banner" 
              className="h-12 object-contain select-none filter drop-shadow-md"
            />
          </div>

          {/* App Title & Version */}
          <h1 className="text-xl font-bold tracking-tight text-primary-theme font-sans">
            FigurayMaker
          </h1>
          <p className="text-xs text-secondary-theme font-mono mt-0.5">
            Version 2.2 (Build 2026.10.8)
          </p>

          {/* Tab Selector & Retro-Inset Content Container */}
          <div className="w-full mt-3 flex flex-col">
            {/* Tab Selector */}
            <div className="flex items-center justify-center gap-1.5 mb-2.5">
              <button
                type="button"
                onClick={() => setActiveTab('specs')}
                className={`px-3 py-1 rounded-md text-[11px] font-medium transition-all cursor-pointer ${
                  activeTab === 'specs' 
                    ? 'retro-chrome-btn active font-bold text-[var(--text-accent)] shadow-xs' 
                    : 'retro-chrome-btn text-secondary-theme hover:text-primary-theme'
                }`}
              >
                Features & Stack
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('credits')}
                className={`px-3 py-1 rounded-md text-[11px] font-medium transition-all cursor-pointer ${
                  activeTab === 'credits' 
                    ? 'retro-chrome-btn active font-bold text-[var(--text-accent)] shadow-xs' 
                    : 'retro-chrome-btn text-secondary-theme hover:text-primary-theme'
                }`}
              >
                Credits & Source
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('legal')}
                className={`px-3 py-1 rounded-md text-[11px] font-medium transition-all cursor-pointer ${
                  activeTab === 'legal' 
                    ? 'retro-chrome-btn active font-bold text-[var(--text-accent)] shadow-xs' 
                    : 'retro-chrome-btn text-secondary-theme hover:text-primary-theme'
                }`}
              >
                Legal
              </button>
            </div>

            {/* Retro-Inset Container Housing Active Tab Content */}
            <div className="retro-inset-well rounded-lg p-3 w-full min-h-[175px] text-xs">
              {/* Tab 1: Features & Stack */}
              {activeTab === 'specs' && (
                <div className="space-y-2.5 animate-in fade-in duration-150">
                  {/* System & Engine Specs Table */}
                  <div className="grid grid-cols-[85px_1fr] gap-y-1 gap-x-2 text-[11px] leading-relaxed pb-2 border-b border-ui-theme">
                    <span className="font-bold text-right text-primary-theme">Engine</span>
                    <span className="text-secondary-theme font-mono">HTML5 2D Canvas • Pixel Kernel</span>

                    <span className="font-bold text-right text-primary-theme">Framework</span>
                    <span className="text-secondary-theme font-mono">React 19 • TypeScript</span>

                    <span className="font-bold text-right text-primary-theme">Styling</span>
                    <span className="text-secondary-theme font-mono">Tailwind CSS (Skeuo & OLED)</span>

                    <span className="font-bold text-right text-primary-theme">Sprite Atlas</span>
                    <span className="text-secondary-theme font-mono">54 Parts • Art by @garlicnibbler2024</span>

                    <span className="font-bold text-right text-primary-theme">Resolution</span>
                    <span className="text-secondary-theme font-mono">Up to 256×256px • 1x & 4x Scaling</span>

                    <span className="font-bold text-right text-primary-theme">Tooling</span>
                    <span className="text-secondary-theme font-mono">Vite • Lucide Icons</span>
                  </div>

                  {/* Core Capabilities */}
                  <div className="text-[11px] text-secondary-theme space-y-1 pt-0.5">
                    <span className="font-bold text-primary-theme block text-[11px]">Core Capabilities:</span>
                    <ul className="list-disc list-inside space-y-0.5 pl-1 text-[10.5px] leading-relaxed">
                      <li>Asset Manager (Toolbox) with 54 modular hand-drawn sprites</li>
                      <li>Revamped Starter Templates with community packages (Robloxian 2.0, iBot, Skeleton, Peter, Noob)</li>
                      <li>Multi-action insertion: New Layer, Active Stamp, PIP Window & Trace Ghost</li>
                      <li>Canonical 1x Wiki scaling (9×8, 11×10, 5×10) & 4x template toggle</li>
                      <li>Multi-Layer Engine with visibility, opacity & locking</li>
                      <li>Real-time Vertical Symmetry drawing & axis alignment</li>
                      <li>Skeuomorphic Retro 2008, Beige, Dark & OLED Dark Themes</li>
                      <li>Reference Manager with virtual pan, zoom & eyedropping</li>
                      <li>PNG Exporter supporting 1× up to 32× superscaled output</li>
                    </ul>
                  </div>
                </div>
              )}

              {/* Tab 2: Credits & Source */}
              {activeTab === 'credits' && (
                <div className="space-y-2.5 text-[11px] text-secondary-theme animate-in fade-in duration-150">
                  {/* Sprite Atlas Artwork Credit Card */}
                  <div className="p-2.5 rounded-lg bg-surface-raised-theme border border-ui-theme space-y-1.5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <Palette className="w-3.5 h-3.5 text-pink-400 shrink-0" />
                        <span className="font-bold text-primary-theme text-[11px]">Original Sprite Atlas (2021)</span>
                      </div>
                      <span className="font-mono text-[9px] px-1.5 py-0.5 rounded retro-inset-well font-bold" style={{ color: 'var(--text-accent)' }}>
                        2021 Artwork
                      </span>
                    </div>
                    <div className="text-[10.5px] leading-relaxed text-secondary-theme">
                      Created by <strong className="text-primary-theme">@garlicnibbler2024</strong> (ROBLOX handle: <strong className="text-primary-theme font-mono">@DJQ2BLUE25</strong>). 
                      The foundational <em>DavidBlxTemplate</em> turnaround sheet and hand-drawn character sprites power FigurayMaker's 54-part Toolbox and starter packages.
                    </div>
                  </div>

                  {/* FigurayMaker Project */}
                  <div className="flex items-center gap-2 p-2 rounded bg-surface-raised-theme border border-ui-theme">
                    <Heart className="w-3.5 h-3.5 text-red-500 shrink-0" />
                    <div>
                      <div className="font-bold text-primary-theme">FigurayMaker Project</div>
                      <div className="text-[10px]">Crafted with love for retro avatar and pixel sprite designers.</div>
                    </div>
                  </div>

                  <a 
                    href="https://github.com/Ceqell/ceqell.github.io/tree/main/sprite-maker-source-code"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between p-2 rounded bg-surface-theme border border-ui-theme text-[11px] hover:border-[var(--text-accent)] transition-colors group cursor-pointer"
                    title="Open source repository on GitHub"
                  >
                    <div className="flex items-center gap-1.5">
                      <Github className="w-3.5 h-3.5 text-primary-theme group-hover:text-[var(--text-accent)] transition-colors" />
                      <span className="font-medium text-primary-theme group-hover:text-[var(--text-accent)] transition-colors">Source Code</span>
                      <ExternalLink className="w-2.5 h-2.5 text-secondary-theme opacity-60 group-hover:opacity-100 transition-opacity" />
                    </div>
                    <span className="text-[10px] text-secondary-theme font-mono">Open Source (Apache-2.0)</span>
                  </a>
                </div>
              )}

              {/* Tab 3: Legal (Apache 2.0 Notice & Full Text) */}
              {activeTab === 'legal' && (
                <div className="flex flex-col gap-2.5 animate-in fade-in duration-150">
                  {/* Copyright Notice */}
                  <div className="flex flex-col gap-1">
                    <span className="text-[10px] text-primary-theme font-semibold">
                      Copyright & Attribution Notice:
                    </span>
                    <div className="p-2 rounded bg-surface-theme border border-ui-theme text-[9.5px] font-mono text-secondary-theme whitespace-pre-wrap leading-relaxed">
                      {apacheLicenseNotice}
                    </div>
                  </div>

                  {/* Full Apache 2.0 Terms */}
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center justify-between px-0.5">
                      <span className="text-[10px] text-primary-theme font-semibold">
                        Full License Terms & Conditions:
                      </span>
                      <a
                        href="https://www.apache.org/licenses/LICENSE-2.0"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[10px] hover:underline flex items-center gap-1 font-medium text-[var(--text-accent)]"
                      >
                        <span>Official URL</span>
                        <ExternalLink className="w-2.5 h-2.5" />
                      </a>
                    </div>
                    <div className="p-3 rounded bg-surface-theme border border-ui-theme text-[9.5px] font-mono text-secondary-theme max-h-52 overflow-y-auto whitespace-pre-wrap leading-relaxed overscroll-contain">
                      {apacheLicenseText.replace(/^\n+/, '').trimEnd()}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Footer Copyright and License notice */}
          <div className="mt-4 pt-3 border-t border-ui-theme w-full text-center text-[10px] text-secondary-theme leading-normal">
            <div>Copyright © 2026 by Ceqell.</div>
            <div className="mt-0.5">
              Licensed under the{' '}
              <a 
                href="https://www.apache.org/licenses/LICENSE-2.0" 
                target="_blank" 
                rel="noopener noreferrer"
                className="underline hover:text-primary-theme cursor-pointer font-medium"
              >
                Apache 2.0 License
              </a>
              {' • '}
              <button
                type="button"
                onClick={() => setActiveTab('legal')}
                className="hover:underline hover:text-primary-theme cursor-pointer font-medium"
              >
                View Terms
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
