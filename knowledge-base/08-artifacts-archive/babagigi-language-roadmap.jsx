import React, { useState } from 'react';

export default function BabagigiLanguageRoadmap() {
  const [activeWave, setActiveWave] = useState(1);
  const [hoveredLang, setHoveredLang] = useState(null);

  const waves = [
    {
      id: 1,
      name: 'Launch',
      subtitle: 'The Foundation',
      timing: 'v1 — at launch',
      count: 12,
      gate: 'Vendor STT + TTS production-grade, no fine-tuning required',
      thesis: 'Ship where the underlying AI stack is unambiguously ready. Validate the product before the platform.',
      color: '#8B4513',
      accent: '#D4A574',
      languages: [
        { name: 'English', native: 'English', speakers: '1.5B', tier: 'core' },
        { name: 'Spanish', native: 'Español', speakers: '600M', tier: 'core' },
        { name: 'Mandarin', native: '普通话', speakers: '1.1B', tier: 'core' },
        { name: 'French', native: 'Français', speakers: '320M', tier: 'core' },
        { name: 'German', native: 'Deutsch', speakers: '135M', tier: 'core' },
        { name: 'Portuguese', native: 'Português', speakers: '260M', tier: 'core' },
        { name: 'Italian', native: 'Italiano', speakers: '85M', tier: 'core' },
        { name: 'Japanese', native: '日本語', speakers: '125M', tier: 'core' },
        { name: 'Korean', native: '한국어', speakers: '82M', tier: 'core' },
        { name: 'Hindi', native: 'हिन्दी', speakers: '600M', tier: 'core' },
        { name: 'Dutch', native: 'Nederlands', speakers: '25M', tier: 'core' },
        { name: 'Polish', native: 'Polski', speakers: '45M', tier: 'core' },
      ]
    },
    {
      id: 2,
      name: 'Fast Follow',
      subtitle: 'Doubling Reach',
      timing: '~6 months post-launch',
      count: 8,
      gate: 'Light language-specific QA — native-speaker review, curated TTS voice selection',
      thesis: 'Expand to high-demand diaspora languages where vendor quality is shippable with care, not engineering.',
      color: '#A0522D',
      accent: '#E5B584',
      languages: [
        { name: 'Vietnamese', native: 'Tiếng Việt', speakers: '85M', tier: 'expand' },
        { name: 'Tagalog', native: 'Tagalog', speakers: '85M', tier: 'expand' },
        { name: 'Arabic (MSA)', native: 'العربية', speakers: '420M', tier: 'expand' },
        { name: 'Russian', native: 'Русский', speakers: '260M', tier: 'expand' },
        { name: 'Turkish', native: 'Türkçe', speakers: '85M', tier: 'expand' },
        { name: 'Indonesian', native: 'Bahasa Indonesia', speakers: '200M', tier: 'expand' },
        { name: 'Thai', native: 'ภาษาไทย', speakers: '70M', tier: 'expand' },
        { name: 'Cantonese', native: '廣東話', speakers: '85M', tier: 'expand' },
      ]
    },
    {
      id: 3,
      name: 'Diaspora Depth',
      subtitle: 'Honoring Distance',
      timing: '~12 months',
      count: 6,
      gate: 'TTS voice quality matures (vendor roadmaps 2026-2027), QA framework hardened from Wave 2',
      thesis: 'Large diaspora populations where TTS quality is the bottleneck, not STT. Wait for the stack to catch up.',
      color: '#704214',
      accent: '#C9A66B',
      languages: [
        { name: 'Bengali', native: 'বাংলা', speakers: '270M', tier: 'depth' },
        { name: 'Tamil', native: 'தமிழ்', speakers: '85M', tier: 'depth' },
        { name: 'Urdu', native: 'اردو', speakers: '230M', tier: 'depth' },
        { name: 'Persian / Farsi', native: 'فارسی', speakers: '110M', tier: 'depth' },
        { name: 'Ukrainian', native: 'Українська', speakers: '40M', tier: 'depth' },
        { name: 'Hebrew', native: 'עברית', speakers: '9M', tier: 'depth' },
      ]
    },
    {
      id: 4,
      name: 'Community Partners',
      subtitle: 'The Platform Thesis',
      timing: '~18+ months',
      count: 6,
      gate: 'Field-partner co-design + community-owned data pipeline. Grandparent recordings become the corpus.',
      thesis: 'Where Babagigi stops being a vendor-API product and becomes a TomorrowLabs platform. Data flywheel made concrete.',
      color: '#5C3317',
      accent: '#B8956A',
      languages: [
        { name: 'Khmer', native: 'ខ្មែរ', speakers: '17M', tier: 'partner', partner: 'Golden Leaf Foundation, Cambodia' },
        { name: 'K\'iche\'', native: 'K\'iche\'', speakers: '1.1M', tier: 'partner', partner: 'California Rotary, Guatemala' },
        { name: 'Kaqchikel', native: 'Kaqchikel', speakers: '500K', tier: 'partner', partner: 'California Rotary, Guatemala' },
        { name: 'Nahuatl', native: 'Nāhuatl', speakers: '1.7M', tier: 'partner', partner: 'N50 Project, Mexico City' },
        { name: 'Mixtec', native: 'Tu\'un Savi', speakers: '500K', tier: 'partner', partner: 'N50 Project, Mexico City' },
        { name: 'TBD', native: 'Selected w/ partner', speakers: '—', tier: 'partner', partner: 'From 25-priority list' },
      ]
    }
  ];

  const currentWave = waves[activeWave - 1];

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(180deg, #F4EBD9 0%, #EBDDC2 100%)',
      fontFamily: 'Georgia, "Iowan Old Style", "Palatino Linotype", serif',
      color: '#2A1810',
      padding: '0',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Paper texture overlay */}
      <div style={{
        position: 'absolute',
        inset: 0,
        backgroundImage: 'radial-gradient(circle at 20% 30%, rgba(139, 69, 19, 0.04) 0%, transparent 50%), radial-gradient(circle at 80% 70%, rgba(92, 51, 23, 0.05) 0%, transparent 50%)',
        pointerEvents: 'none'
      }} />

      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '60px 40px', position: 'relative' }}>

        {/* Header — like a manuscript title page */}
        <header style={{ textAlign: 'center', marginBottom: '60px', borderBottom: '1px solid #8B4513', paddingBottom: '40px' }}>
          <div style={{
            fontSize: '11px',
            letterSpacing: '4px',
            color: '#8B4513',
            marginBottom: '20px',
            textTransform: 'uppercase',
            fontWeight: '600'
          }}>
            Babagigi · TomorrowLabs
          </div>
          <h1 style={{
            fontSize: '52px',
            fontWeight: '400',
            margin: '0 0 16px 0',
            fontStyle: 'italic',
            letterSpacing: '-0.5px',
            lineHeight: '1.1'
          }}>
            A Cartography of Languages
          </h1>
          <p style={{
            fontSize: '17px',
            color: '#5C3317',
            maxWidth: '600px',
            margin: '0 auto',
            lineHeight: '1.6',
            fontStyle: 'italic'
          }}>
            Four waves of expansion, each gated by what makes the work worth shipping —
            from vendor readiness to community partnership.
          </p>
        </header>

        {/* Wave selector — like chapter tabs */}
        <nav style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: '0',
          marginBottom: '50px',
          borderTop: '2px solid #2A1810',
          borderBottom: '2px solid #2A1810'
        }}>
          {waves.map(wave => (
            <button
              key={wave.id}
              onClick={() => setActiveWave(wave.id)}
              style={{
                padding: '24px 16px',
                border: 'none',
                borderRight: wave.id < 4 ? '1px solid #8B4513' : 'none',
                background: activeWave === wave.id ? wave.color : 'transparent',
                color: activeWave === wave.id ? '#F4EBD9' : '#2A1810',
                cursor: 'pointer',
                fontFamily: 'inherit',
                textAlign: 'left',
                transition: 'all 0.4s ease',
                position: 'relative'
              }}
            >
              <div style={{
                fontSize: '10px',
                letterSpacing: '3px',
                opacity: 0.7,
                marginBottom: '8px',
                textTransform: 'uppercase'
              }}>
                Wave {wave.id}
              </div>
              <div style={{
                fontSize: '22px',
                fontStyle: 'italic',
                fontWeight: '400',
                marginBottom: '4px'
              }}>
                {wave.name}
              </div>
              <div style={{
                fontSize: '13px',
                opacity: 0.85
              }}>
                {wave.count} languages
              </div>
            </button>
          ))}
        </nav>

        {/* Active wave detail */}
        <section style={{
          background: '#FAF3E3',
          border: `1px solid ${currentWave.color}`,
          padding: '50px',
          marginBottom: '40px',
          position: 'relative',
          boxShadow: '0 2px 20px rgba(92, 51, 23, 0.08)'
        }}>
          {/* Decorative corner ornaments */}
          {['top-left', 'top-right', 'bottom-left', 'bottom-right'].map(pos => {
            const [v, h] = pos.split('-');
            return (
              <div key={pos} style={{
                position: 'absolute',
                [v]: '12px',
                [h]: '12px',
                width: '20px',
                height: '20px',
                borderTop: v === 'top' ? `2px solid ${currentWave.color}` : 'none',
                borderBottom: v === 'bottom' ? `2px solid ${currentWave.color}` : 'none',
                borderLeft: h === 'left' ? `2px solid ${currentWave.color}` : 'none',
                borderRight: h === 'right' ? `2px solid ${currentWave.color}` : 'none',
                opacity: 0.6
              }} />
            );
          })}

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '60px', marginBottom: '40px' }}>
            <div>
              <div style={{
                fontSize: '10px',
                letterSpacing: '3px',
                color: currentWave.color,
                marginBottom: '12px',
                textTransform: 'uppercase',
                fontWeight: '700'
              }}>
                {currentWave.subtitle}
              </div>
              <h2 style={{
                fontSize: '38px',
                margin: '0 0 8px 0',
                fontStyle: 'italic',
                fontWeight: '400',
                color: currentWave.color
              }}>
                {currentWave.name}
              </h2>
              <div style={{
                fontSize: '14px',
                color: '#5C3317',
                fontStyle: 'italic'
              }}>
                {currentWave.timing}
              </div>
            </div>

            <div>
              <div style={{
                fontSize: '10px',
                letterSpacing: '3px',
                color: currentWave.color,
                marginBottom: '8px',
                textTransform: 'uppercase',
                fontWeight: '700'
              }}>
                The Gate
              </div>
              <p style={{
                fontSize: '15px',
                lineHeight: '1.65',
                margin: '0 0 20px 0',
                color: '#2A1810'
              }}>
                {currentWave.gate}
              </p>
              <div style={{
                fontSize: '10px',
                letterSpacing: '3px',
                color: currentWave.color,
                marginBottom: '8px',
                textTransform: 'uppercase',
                fontWeight: '700'
              }}>
                Thesis
              </div>
              <p style={{
                fontSize: '15px',
                lineHeight: '1.65',
                margin: 0,
                fontStyle: 'italic',
                color: '#5C3317'
              }}>
                {currentWave.thesis}
              </p>
            </div>
          </div>

          {/* Language cards */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
            gap: '12px',
            paddingTop: '30px',
            borderTop: `1px solid ${currentWave.accent}`
          }}>
            {currentWave.languages.map((lang, i) => (
              <div
                key={lang.name + i}
                onMouseEnter={() => setHoveredLang(lang.name + currentWave.id)}
                onMouseLeave={() => setHoveredLang(null)}
                style={{
                  padding: '16px',
                  background: hoveredLang === lang.name + currentWave.id ? currentWave.color : '#FFFFFF',
                  color: hoveredLang === lang.name + currentWave.id ? '#F4EBD9' : '#2A1810',
                  border: `1px solid ${currentWave.accent}`,
                  transition: 'all 0.3s ease',
                  cursor: 'default',
                  position: 'relative'
                }}
              >
                <div style={{
                  fontSize: '15px',
                  fontWeight: '600',
                  marginBottom: '4px',
                  fontStyle: 'italic'
                }}>
                  {lang.name}
                </div>
                <div style={{
                  fontSize: '13px',
                  opacity: 0.75,
                  marginBottom: '8px'
                }}>
                  {lang.native}
                </div>
                <div style={{
                  fontSize: '10px',
                  letterSpacing: '1.5px',
                  textTransform: 'uppercase',
                  opacity: 0.6
                }}>
                  {lang.speakers} speakers
                </div>
                {lang.partner && (
                  <div style={{
                    fontSize: '10px',
                    fontStyle: 'italic',
                    marginTop: '8px',
                    opacity: 0.8,
                    borderTop: `1px dotted ${hoveredLang === lang.name + currentWave.id ? '#F4EBD9' : currentWave.accent}`,
                    paddingTop: '6px'
                  }}>
                    {lang.partner}
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* The journey strip — visual timeline */}
        <section style={{ marginTop: '60px', marginBottom: '40px' }}>
          <div style={{
            fontSize: '10px',
            letterSpacing: '4px',
            color: '#8B4513',
            marginBottom: '20px',
            textTransform: 'uppercase',
            textAlign: 'center',
            fontWeight: '700'
          }}>
            The Journey · 32 Languages over 18 Months
          </div>

          <div style={{
            position: 'relative',
            padding: '30px 0',
            background: '#FAF3E3',
            border: '1px solid #8B4513'
          }}>
            {/* Timeline line */}
            <div style={{
              position: 'absolute',
              left: '5%',
              right: '5%',
              top: '50%',
              height: '2px',
              background: 'linear-gradient(90deg, #8B4513 0%, #A0522D 33%, #704214 66%, #5C3317 100%)',
              transform: 'translateY(-50%)'
            }} />

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(4, 1fr)',
              position: 'relative'
            }}>
              {waves.map((wave) => (
                <div key={wave.id} style={{ textAlign: 'center', position: 'relative' }}>
                  <div
                    onClick={() => setActiveWave(wave.id)}
                    style={{
                      width: activeWave === wave.id ? '28px' : '20px',
                      height: activeWave === wave.id ? '28px' : '20px',
                      borderRadius: '50%',
                      background: wave.color,
                      margin: '0 auto',
                      border: '3px solid #FAF3E3',
                      boxShadow: `0 0 0 2px ${wave.color}`,
                      cursor: 'pointer',
                      transition: 'all 0.3s ease'
                    }}
                  />
                  <div style={{
                    marginTop: '16px',
                    fontSize: '12px',
                    color: wave.color,
                    fontStyle: 'italic',
                    fontWeight: activeWave === wave.id ? '700' : '400'
                  }}>
                    {wave.timing}
                  </div>
                  <div style={{
                    fontSize: '10px',
                    color: '#5C3317',
                    marginTop: '4px',
                    letterSpacing: '1px',
                    textTransform: 'uppercase'
                  }}>
                    +{wave.count} languages
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Strategic notes — like marginalia */}
        <section style={{
          marginTop: '60px',
          padding: '40px',
          background: 'transparent',
          borderTop: '2px solid #2A1810',
          borderBottom: '2px solid #2A1810'
        }}>
          <div style={{
            fontSize: '10px',
            letterSpacing: '4px',
            color: '#8B4513',
            marginBottom: '24px',
            textTransform: 'uppercase',
            fontWeight: '700'
          }}>
            Marginalia · Why this structure
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '40px' }}>
            <div>
              <div style={{
                fontSize: '20px',
                fontStyle: 'italic',
                marginBottom: '12px',
                color: '#5C3317'
              }}>
                Investor legibility
              </div>
              <p style={{ fontSize: '14px', lineHeight: '1.65', margin: 0, color: '#2A1810' }}>
                Waves 1–3 tell a clean consumer growth story. Wave 4 is the language preservation
                platform thesis. The roadmap shows how they connect — without forcing a choice.
              </p>
            </div>
            <div>
              <div style={{
                fontSize: '20px',
                fontStyle: 'italic',
                marginBottom: '12px',
                color: '#5C3317'
              }}>
                Two-entity architecture
              </div>
              <p style={{ fontSize: '14px', lineHeight: '1.65', margin: 0, color: '#2A1810' }}>
                Waves 1–3 are TomorrowLabs commercial. Wave 4 is where the nonprofit arm co-owns
                the work with field partners. The roadmap encodes the two-entity model before
                it's formalized.
              </p>
            </div>
            <div>
              <div style={{
                fontSize: '20px',
                fontStyle: 'italic',
                marginBottom: '12px',
                color: '#5C3317'
              }}>
                A defensible "not yet"
              </div>
              <p style={{ fontSize: '14px', lineHeight: '1.65', margin: 0, color: '#2A1810' }}>
                Diaspora communities will ask "when is our language?" Transparent gating logic
                ("here's what unlocks it") respects the question better than silence or
                vague promises.
              </p>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer style={{
          textAlign: 'center',
          marginTop: '60px',
          paddingTop: '30px',
          fontSize: '11px',
          letterSpacing: '3px',
          color: '#8B4513',
          textTransform: 'uppercase'
        }}>
          Drafted for Weston · Babagigi · TomorrowLabs · 2026
        </footer>
      </div>
    </div>
  );
}
