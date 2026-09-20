import { useState } from 'react';

type ProbeState = 'idle' | 'running' | 'complete';

interface PlaybackEnvironmentReport {
    checkedAt: string;
    secureContext: boolean;
    origin: string;
    userAgent: string;
    emeAvailable: boolean;
    keySystems: KeySystemResult[];
}

interface KeySystemResult {
    keySystem: string;
    label: string;
    supported: boolean;
    detail: string;
}

interface KeySystemCandidate {
  keySystem: string;
  label: string;
  configurations: MediaKeySystemConfiguration[];
}

const AAC_MP4 = {
  contentType: 'audio/mp4; codecs="mp4a.40.2"',
};

const COMMON_AUDIO_CAPABILITIES = [
  AAC_MP4,
  { contentType: 'audio/mp4; codecs="mp4a.40.5"' },
  { contentType: 'audio/webm; codecs="opus"' },
  { contentType: 'audio/webm; codecs="vorbis"' },
  { contentType: 'audio/ogg; codecs="opus"' },
  { contentType: 'audio/ogg; codecs="vorbis"' },
];

const KEY_SYSTEMS: KeySystemCandidate[] = [
  {
    keySystem: 'com.widevine.alpha',
    label: 'Widevine',
    configurations: [
      {
        initDataTypes: ['cenc'],
        audioCapabilities: [
          {
            ...AAC_MP4,
            encryptionScheme: 'cenc',
          },
        ],
      },
      {
        initDataTypes: ['webm'],
        audioCapabilities: [
          { contentType: 'audio/webm; codecs="opus"' },
          { contentType: 'audio/webm; codecs="vorbis"' },
        ],
      },
      {
        audioCapabilities: COMMON_AUDIO_CAPABILITIES,
      },
    ],
  },
  {
    keySystem: 'com.apple.fps',
    label: 'Apple FairPlay',
    configurations: [
      {
        initDataTypes: ['sinf'],
        audioCapabilities: [
          {
            ...AAC_MP4,
            encryptionScheme: 'cbcs',
          },
        ],
      },
      {
        initDataTypes: ['cenc'],
        audioCapabilities: [
          {
            ...AAC_MP4,
            encryptionScheme: 'cbcs',
          },
        ],
      },
      {
        audioCapabilities: COMMON_AUDIO_CAPABILITIES,
      },
    ],
  },
  {
    keySystem: 'com.apple.fps.1_0',
    label: 'Apple FairPlay legacy identifier',
    configurations: [
      {
        initDataTypes: ['sinf'],
        audioCapabilities: [
          {
            ...AAC_MP4,
            encryptionScheme: 'cbcs',
          },
        ],
      },
      {
        audioCapabilities: COMMON_AUDIO_CAPABILITIES,
      },
    ],
  },
  {
    keySystem: 'com.microsoft.playready',
    label: 'Microsoft PlayReady',
    configurations: [
      {
        initDataTypes: ['cenc'],
        audioCapabilities: [
          {
            ...AAC_MP4,
            encryptionScheme: 'cenc',
          },
        ],
      },
      {
        audioCapabilities: COMMON_AUDIO_CAPABILITIES,
      },
    ],
  },
  {
    keySystem: 'org.w3.clearkey',
    label: 'W3C Clear Key control',
    configurations: [
      {
        initDataTypes: ['cenc'],
        audioCapabilities: [
          {
            ...AAC_MP4,
            encryptionScheme: 'cenc',
          },
        ],
      },
      {
        audioCapabilities: COMMON_AUDIO_CAPABILITIES,
      },
    ],
  },
];

async function probeKeySystem(
  keySystem: string,
  label: string,
  configurations: MediaKeySystemConfiguration[],
): Promise<KeySystemResult> {
  try {
    const access = await navigator.requestMediaKeySystemAccess(
      keySystem,
      configurations,
    );

    const configuration = access.getConfiguration();

    const initData =
      configuration.initDataTypes?.join(', ') || 'unspecified';

    const audio = configuration.audioCapabilities
      ?.map((capability) => {
        const encryption = capability.encryptionScheme
          ? `, encryption: ${capability.encryptionScheme}`
          : '';

        return `${capability.contentType}${encryption}`;
      })
      .join('; ');

    return {
      keySystem,
      label,
      supported: true,
      detail: `Init data: ${initData}. Audio: ${audio || 'unspecified'}`,
    };
  } catch (error) {
    return {
      keySystem,
      label,
      supported: false,
      detail:
        error instanceof Error
          ? `${error.name}: ${error.message}`
          : String(error),
    };
  }
}

export function PlaybackEnvironmentProbe() {
    const [state, setState] = useState<ProbeState>('idle');
    const [report, setReport] = useState<PlaybackEnvironmentReport | null>(null);

    async function runProbe() {
        setState('running');

        const emeAvailable =
            typeof navigator.requestMediaKeySystemAccess === 'function';

        const keySystems = emeAvailable
            ? await Promise.all(
                KEY_SYSTEMS.map(({ keySystem, label, configurations }) =>
                    probeKeySystem(keySystem, label, configurations),
                ),
            )
            : [];

        setReport({
            checkedAt: new Date().toISOString(),
            secureContext: window.isSecureContext,
            origin: window.location.origin,
            userAgent: navigator.userAgent,
            emeAvailable,
            keySystems,
        });

        setState('complete');
    }

    return (
        <section
            className="playback-environment-probe"
            aria-labelledby="playback-probe-title"
        >
            <header className="playback-probe-header">
                <div>
                    <h2 id="playback-probe-title">
                        Protected playback compatibility
                    </h2>

                    <p>
                        Check whether this webview exposes Encrypted Media Extensions and
                        accepts common DRM key-system configurations
                    </p>
                </div>

                <button
                    type="button"
                    onClick={() => void runProbe()}
                    disabled={state === 'running'}
                >
                    {state === 'running'
                        ? 'Running probe…'
                        : report
                            ? 'Run again'
                            : 'Run compatibility probe'}
                </button>
            </header>

            {report && (
                <>
                    <dl className="playback-probe-summary">
                        <div>
                            <dt>Secure context</dt>
                            <dd>{report.secureContext ? 'Yes' : 'No'}</dd>
                        </div>

                        <div>
                            <dt>EME API</dt>
                            <dd>{report.emeAvailable ? 'Available' : 'Unavailable'}</dd>
                        </div>

                        <div>
                            <dt>Origin</dt>
                            <dd>
                                <code>{report.origin}</code>
                            </dd>
                        </div>

                        <div>
                            <dt>User Agent</dt>
                            <dd>
                                <code>{report.userAgent}</code>
                            </dd>
                        </div>
                    </dl>
                    <div className="playback-probe-key-systems">
                        <h3>Key systems</h3>

                        <ul>
                            {report.keySystems.map((result) => (
                                <li
                                    key={result.keySystem}
                                    className={
                                        result.supported
                                            ? 'playback-probe-result playback-probe-result--supported'
                                            : 'playback-probe-result playback-probe-result--unsupported'
                                    }
                                >
                                    <div className="playback-probe-result-heading">
                                        <strong>{result.label}</strong>

                                        <span>
                                            {result.supported 
                                                ? 'Configuration recognized' 
                                                : 'No tested configuration recognized'
                                            }
                                        </span>
                                    </div>

                                    <code>{result.keySystem}</code>
                                    <small>{result.detail}</small>
                                </li>
                            ))}
                        </ul>
                    </div>
                </>
            )}
        </section>
    );
}