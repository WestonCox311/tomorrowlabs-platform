import React, { useState } from 'react';

export default function BabagigiDemandRoadmap() {
  const [activeWave, setActiveWave] = useState(1);
  const [hoveredLang, setHoveredLang] = useState(null);
  const [showMissionTrack, setShowMissionTrack] = useState(false);

  const waves = [
    {
      id: 1,
      name: 'Demand-Validated Core',
      subtitle: 'Where the need is loudest',
      timing: 'v1 launch',
      count: 8,
      gate: 'Large elderly heritage population × intergenerational urgency × production-grade tech',
      thesis: 'These eight languages each show overwhelming demand signal AND a tech stack that just works. No compromises, no asterisks.',
      color: '#2D5F3F',
      accent: '#7FA88E',
      tint: '#E8F0EB',
      languages: [
        { name: 'Spanish', native: 'Español', usSpeakers: '42M', signal: 'Largest heritage population by 13:1', urgency: 'High' },
        { name: 'Mandarin', native: '普通话', usSpeakers: '2.4M', signal: 'Strong intergenerational gap, high spend', urgency: 'High' },
        { name: 'Tagalog', native: 'Tagalog', usSpeakers: '1.8M', signal: '33% of speakers are 60+ — strongest grandparent demographic', urgency: 'Critical' },
        { name: 'Vietnamese', native: 'Tiếng Việt', usSpeakers: '1.5M', signal: 'Refugee-wave grandparents now elderly', urgency: 'Critical' },
        { name: 'Korean', native: '한국어', usSpeakers: '1.1M', signal: 'Severe third-gen language loss', urgency: 'High' },
        { name: 'Arabic', native: 'العربية', usSpeakers: '1.4M', signal: 'Recent immigration, wide generational gap', urgency: 'High' },
        { name: 'French', native: 'Français', usSpeakers: '1.2M', signal: 'Strong Caribbean & African diaspora storytelling tradition', urgency: 'Moderate' },
        { name: 'Portuguese', native: 'Português', usSpeakers: '950K', signal: 'Brazilian-American growth + Portuguese heritage', urgency: 'Moderate' },
      ]
    },
    {
      id: 2,
      name: 'Demand Expansion',
      subtitle: 'Surfacing what was hidden',
      timing: '~6 months',
      count: 6,
      gate: 'Strong demand signal but requires language-specific QA or TTS voice curation',
      thesis: 'Cantonese, Haitian Creole, and Persian are often missing from "obvious" lists but show some of the strongest grandparent-product fit in the data.',
      color: '#3A6F52',
      accent: '#92B6A0',
      tint: '#EAF2EC',
      languages: [
        { name: 'Russian', native: 'Русский', usSpeakers: '950K', signal: 'Aging Soviet-era immigrant wave', urgency: 'High' },
        { name: 'Hindi', native: 'हिन्दी', usSpeakers: '900K', signal: '18M+ global Indian diaspora', urgency: 'High' },
        { name: 'Cantonese', native: '廣東話', usSpeakers: '550K', signal: 'The "missing" Chinese — disproportionately elderly speakers', urgency: 'Critical' },
        { name: 'Japanese', native: '日本語', usSpeakers: '460K', signal: 'Deep oral storytelling culture', urgency: 'Moderate' },
        { name: 'Persian / Farsi', native: 'فارسی', usSpeakers: '420K', signal: 'High purchasing power, strong grandparent role', urgency: 'High' },
        { name: 'Haitian Creole', native: 'Kreyòl Ayisyen', usSpeakers: '900K', signal: 'Underserved by tech, strong oral tradition', urgency: 'High' },
      ]
    },
    {
      id: 3,
      name: 'Aging Heritage',
      subtitle: 'Real demand, contracting market',
      timing: '~12 months',
      count: 6,
      gate: 'TTS quality matures further; QA processes hardened',
      thesis: 'Significant US populations but the customer base is contracting — language transmission already largely broken. Real value, smaller TAM.',
      color: '#52805F',
      accent: '#A5C3B0',
      tint: '#ECF3EE',
      languages: [
        { name: 'German', native: 'Deutsch', usSpeakers: '900K', signal: 'Elderly heritage speakers, mostly past peak transmission', urgency: 'Low' },
        { name: 'Italian', native: 'Italiano', usSpeakers: '700K', signal: 'Aging heritage population, strong cultural memory', urgency: 'Moderate' },
        { name: 'Polish', native: 'Polski', usSpeakers: '600K', signal: 'Aging immigrant generation, urban concentration', urgency: 'Moderate' },
        { name: 'Greek', native: 'Ελληνικά', usSpeakers: '300K', signal: 'Strong cultural identity, aging community', urgency: 'Moderate' },
        { name: 'Armenian', native: 'Հայերեն', usSpeakers: '240K', signal: 'High community cohesion, transmission concern', urgency: 'High' },
        { name: 'Ukrainian', native: 'Українська', usSpeakers: '180K', signal: 'Recent refugee wave creating new demand', urgency: 'High' },
      ]
    },
    {
      id: 4,
      name: 'Where Demand Stops',
      subtitle: 'The line of commercial logic',
      timing: 'End of pure-demand roadmap',
      count: 0,
      gate: 'Commercial demand alone does not justify further expansion',
      thesis: 'A purely demand-driven roadmap stops here at ~20 languages. Anything beyond requires either mission-driven cross-subsidy or a different funding model entirely.',
      color: '#1A3D2A',
      accent: '#5A7A66',
      tint: '#DFE8E2',
      languages: []
    }
  ];

  const missionTrack = {
    name: 'Mission Track',
    subtitle: 'Beyond what demand alone supports',
    color: '#8B4513',
    accent: '#D4A574',
    tint: '#F4EBD9',
    description: 'Languages selected for cultural preservation and community partnership, not commercial demand. Requires cross-subsidy from the commercial waves or separate nonprofit/grant funding.',
    languages: [
      { name: 'Khmer', native: 'ខ្មែរ', signal: 'Cambodia field partnership', urgency: 'Mission' },
      { name: 'K\'iche\'', native: 'K\'iche\'', signal: 'Guatemala highland communities', urgency: 'Mission' },
      { name: 'Nahuatl', native: 'Nāhuatl', signal: 'Mexico indigenous language preservation', urgency: 'Mission' },
      { name: 'Mixtec', native: 'Tu\'un Savi', signal: 'Mexico indigenous, OAX diaspora', urgency: 'Mission' },
      { name: 'Lao', native: 'ລາວ', signal: 'Refugee diaspora, language preservation', urgency: 'Mission' },
      { name: 'Hmong', native: 'Hmoob', signal: 'Strong US refugee community, oral tradition', urgency: 'Mission' },
    ]
  };

  const currentWave = waves[activeWave - 1];

  const urgencyColor = (urgency, baseColor) => {
    if (urgency === 'Critical') return '#C8442D';
    if (urgency === 'High') return '#D88842';
    if (urgency === 'Moderate') return '#6B8E5A';
    if (urgency === 'Low') return '#8C9B92';
    return baseColor;
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: '#F7F4ED',
      fontFamily: '"Iowan Old Style", "Palatino Linotype", Georgia, serif',
      color: '#1A2620',
      padding: '0',
      position: 'relative',
    }}>
      <div style={{ maxWidth: '1240px', margin: '0 auto', padding: '60px 40px' }}>

        {/* Header */}
        <header style={{ marginBottom: '50px' }}>
          <div style={{
            fontSize: '11px',
            letterSpacing: '4px',
            color: '#2D5F3F',
            marginBottom: '24px',
            textTransform: 'uppercase',
            fontWeight: '700',
            display: 'flex',
            alignItems: 'center',
            gap: '12px'
          }}>
            <span style={{ display: 'inline-block', width: '32px', height: '1px', background: '#2D5F3F' }}></span>
            Babagigi · A Demand-First Roadmap
            <span style={{ display: 'inline-block', width: '32px', height: '1px', background: '#2D5F3F' }}></span>
          </div>

          <h1 style={{
            fontSize: '56px',
            fontWeight: '400',
            margin: '0 0 24px 0',
            letterSpacing: '-1px',
            lineHeight: '1.05',
            maxWidth: '900px'
          }}>
            Where the need is <em style={{ color: '#2D5F3F' }}>loudest</em>,<br/>
            and where it <em style={{ color: '#8B4513' }}>stops being</em> a market.
          </h1>

          <p style={{
            fontSize: '18px',
            color: '#3D4F47',
            maxWidth: '720px',
            lineHeight: '1.6',
            marginTop: '20px',
            fontStyle: 'italic'
          }}>
            Rebuilt from first principles: elderly heritage speakers × intergenerational urgency × production-grade tech.
            Twenty languages where demand alone justifies the work — and six more where mission picks up where the market won't.
          </p>
        </header>

        {/* Track toggle */}
        <div style={{
          display: 'flex',
          gap: '0',
          marginBottom: '40px',
          border: '2px solid #1A2620',
          background: '#FFFFFF'
        }}>
          <button
            onClick={() => setShowMissionTrack(false)}
            style={{
              flex: 1,
              padding: '20px 28px',
              border: 'none',
              borderRight: '2px solid #1A2620',
              background: !showMissionTrack ? '#2D5F3F' : 'transparent',
              color: !showMissionTrack ? '#F7F4ED' : '#1A2620',
              cursor: 'pointer',
              fontFamily: 'inherit',
              textAlign: 'left',
              transition: 'all 0.3s ease'
            }}
          >
            <div style={{ fontSize: '10px', letterSpacing: '3px', opacity: 0.7, marginBottom: '6px', textTransform: 'uppercase' }}>
              Track 1
            </div>
            <div style={{ fontSize: '22px', fontStyle: 'italic' }}>Commercial Demand</div>
            <div style={{ fontSize: '13px', opacity: 0.8, marginTop: '4px' }}>20 languages · funded by revenue</div>
          </button>
          <button
            onClick={() => setShowMissionTrack(true)}
            style={{
              flex: 1,
              padding: '20px 28px',
              border: 'none',
              background: showMissionTrack ? '#8B4513' : 'transparent',
              color: showMissionTrack ? '#F7F4ED' : '#1A2620',
              cursor: 'pointer',
              fontFamily: 'inherit',
              textAlign: 'left',
              transition: 'all 0.3s ease'
            }}
          >
            <div style={{ fontSize: '10px', letterSpacing: '3px', opacity: 0.7, marginBottom: '6px', textTransform: 'uppercase' }}>
              Track 2
            </div>
            <div style={{ fontSize: '22px', fontStyle: 'italic' }}>Mission Extension</div>
            <div style={{ fontSize: '13px', opacity: 0.8, marginTop: '4px' }}>+6 languages · cross-subsidized or grant-funded</div>
          </button>
        </div>

        {!showMissionTrack ? (
          <>
            {/* Wave selector */}
            <nav style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(4, 1fr)',
              gap: '0',
              marginBottom: '0',
              borderTop: '1px solid #1A2620',
              borderLeft: '1px solid #1A2620',
              borderRight: '1px solid #1A2620'
            }}>
              {waves.map((wave, idx) => (
                <button
                  key={wave.id}
                  onClick={() => setActiveWave(wave.id)}
                  style={{
                    padding: '24px 18px',
                    border: 'none',
                    borderRight: idx < 3 ? '1px solid #1A2620' : 'none',
                    borderBottom: '1px solid #1A2620',
                    background: activeWave === wave.id ? wave.color : '#FFFFFF',
                    color: activeWave === wave.id ? '#F7F4ED' : '#1A2620',
                    cursor: 'pointer',
                    fontFamily: 'inherit',
                    textAlign: 'left',
                    transition: 'all 0.3s ease',
                    position: 'relative'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginBottom: '10px' }}>
                    <div style={{ fontSize: '32px', fontWeight: '300', lineHeight: '1' }}>0{wave.id}</div>
                    <div style={{ fontSize: '10px', letterSpacing: '2px', opacity: 0.7, textTransform: 'uppercase' }}>
                      Wave
                    </div>
                  </div>
                  <div style={{ fontSize: '18px', fontStyle: 'italic', fontWeight: '400', marginBottom: '6px', lineHeight: '1.2' }}>
                    {wave.name}
                  </div>
                  <div style={{ fontSize: '12px', opacity: 0.85 }}>
                    {wave.count > 0 ? `${wave.count} languages` : 'Hard stop'}
                  </div>
                </button>
              ))}
            </nav>

            {/* Active wave detail */}
            <section style={{
              background: currentWave.tint,
              border: `1px solid ${currentWave.color}`,
              borderTop: 'none',
              padding: '50px',
              position: 'relative'
            }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '50px', marginBottom: '40px' }}>
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
                    fontSize: '36px',
                    margin: '0 0 16px 0',
                    fontStyle: 'italic',
                    fontWeight: '400',
                    color: currentWave.color,
                    lineHeight: '1.1'
                  }}>
                    {currentWave.name}
                  </h2>
                  <div style={{
                    fontSize: '13px',
                    color: '#3D4F47',
                    fontStyle: 'italic',
                    paddingBottom: '12px',
                    borderBottom: `1px solid ${currentWave.accent}`,
                    marginBottom: '12px'
                  }}>
                    Timing · {currentWave.timing}
                  </div>
                  <div style={{ fontSize: '13px', color: '#3D4F47' }}>
                    Volume · {currentWave.count > 0 ? `${currentWave.count} languages` : 'Roadmap terminates'}
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
                    Selection Gate
                  </div>
                  <p style={{ fontSize: '15px', lineHeight: '1.65', margin: '0 0 24px 0', color: '#1A2620' }}>
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
                    The Read
                  </div>
                  <p style={{ fontSize: '15px', lineHeight: '1.65', margin: 0, fontStyle: 'italic', color: '#3D4F47' }}>
                    {currentWave.thesis}
                  </p>
                </div>
              </div>

              {/* Language cards */}
              {currentWave.languages.length > 0 ? (
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
                  gap: '14px',
                  paddingTop: '30px',
                  borderTop: `1px solid ${currentWave.accent}`
                }}>
                  {currentWave.languages.map((lang, i) => (
                    <div
                      key={lang.name + i}
                      onMouseEnter={() => setHoveredLang(lang.name + currentWave.id)}
                      onMouseLeave={() => setHoveredLang(null)}
                      style={{
                        padding: '20px',
                        background: hoveredLang === lang.name + currentWave.id ? '#FFFFFF' : '#FFFFFF',
                        border: hoveredLang === lang.name + currentWave.id ? `2px solid ${currentWave.color}` : `1px solid ${currentWave.accent}`,
                        transition: 'all 0.2s ease',
                        cursor: 'default',
                        position: 'relative',
                        transform: hoveredLang === lang.name + currentWave.id ? 'translateY(-2px)' : 'translateY(0)',
                        boxShadow: hoveredLang === lang.name + currentWave.id ? '0 4px 16px rgba(26, 38, 32, 0.08)' : 'none'
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                        <div>
                          <div style={{ fontSize: '17px', fontWeight: '600', fontStyle: 'italic', color: '#1A2620' }}>
                            {lang.name}
                          </div>
                          <div style={{ fontSize: '13px', opacity: 0.6, marginTop: '2px' }}>
                            {lang.native}
                          </div>
                        </div>
                        <div style={{
                          fontSize: '9px',
                          letterSpacing: '1.5px',
                          textTransform: 'uppercase',
                          fontWeight: '700',
                          padding: '4px 8px',
                          background: urgencyColor(lang.urgency, currentWave.color),
                          color: '#FFFFFF',
                          whiteSpace: 'nowrap'
                        }}>
                          {lang.urgency}
                        </div>
                      </div>

                      <div style={{
                        fontSize: '11px',
                        letterSpacing: '1.5px',
                        textTransform: 'uppercase',
                        color: currentWave.color,
                        marginTop: '12px',
                        marginBottom: '4px',
                        fontWeight: '700'
                      }}>
                        US Speakers · {lang.usSpeakers}
                      </div>

                      <div style={{
                        fontSize: '13px',
                        lineHeight: '1.5',
                        color: '#3D4F47',
                        marginTop: '8px',
                        fontStyle: 'italic'
                      }}>
                        {lang.signal}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{
                  paddingTop: '40px',
                  borderTop: `1px solid ${currentWave.accent}`,
                  textAlign: 'center'
                }}>
                  <div style={{
                    fontSize: '60px',
                    fontStyle: 'italic',
                    fontWeight: '300',
                    color: currentWave.color,
                    marginBottom: '16px',
                    lineHeight: '1'
                  }}>
                    ∎
                  </div>
                  <p style={{
                    fontSize: '17px',
                    color: '#1A2620',
                    maxWidth: '560px',
                    margin: '0 auto',
                    lineHeight: '1.6'
                  }}>
                    At twenty languages, the demand-driven business case runs out.
                    Adding a 21st language costs more than it returns — unless a different logic takes over.
                  </p>
                  <button
                    onClick={() => setShowMissionTrack(true)}
                    style={{
                      marginTop: '32px',
                      padding: '14px 32px',
                      border: '2px solid #8B4513',
                      background: 'transparent',
                      color: '#8B4513',
                      fontFamily: 'inherit',
                      fontSize: '13px',
                      letterSpacing: '2px',
                      textTransform: 'uppercase',
                      cursor: 'pointer',
                      fontWeight: '700',
                      transition: 'all 0.3s ease'
                    }}
                    onMouseEnter={(e) => { e.target.style.background = '#8B4513'; e.target.style.color = '#F7F4ED'; }}
                    onMouseLeave={(e) => { e.target.style.background = 'transparent'; e.target.style.color = '#8B4513'; }}
                  >
                    See the Mission Track →
                  </button>
                </div>
              )}
            </section>
          </>
        ) : (
          /* Mission Track view */
          <section style={{
            background: missionTrack.tint,
            border: `1px solid ${missionTrack.color}`,
            padding: '50px',
            position: 'relative'
          }}>
            <div style={{ marginBottom: '40px' }}>
              <div style={{
                fontSize: '10px',
                letterSpacing: '3px',
                color: missionTrack.color,
                marginBottom: '12px',
                textTransform: 'uppercase',
                fontWeight: '700'
              }}>
                {missionTrack.subtitle}
              </div>
              <h2 style={{
                fontSize: '36px',
                margin: '0 0 20px 0',
                fontStyle: 'italic',
                fontWeight: '400',
                color: missionTrack.color
              }}>
                {missionTrack.name}
              </h2>
              <p style={{
                fontSize: '16px',
                lineHeight: '1.65',
                maxWidth: '780px',
                color: '#1A2620',
                fontStyle: 'italic'
              }}>
                {missionTrack.description}
              </p>
            </div>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
              gap: '14px',
              paddingTop: '30px',
              borderTop: `1px solid ${missionTrack.accent}`
            }}>
              {missionTrack.languages.map((lang, i) => (
                <div
                  key={lang.name + i}
                  onMouseEnter={() => setHoveredLang('m' + lang.name)}
                  onMouseLeave={() => setHoveredLang(null)}
                  style={{
                    padding: '20px',
                    background: '#FFFFFF',
                    border: hoveredLang === 'm' + lang.name ? `2px solid ${missionTrack.color}` : `1px solid ${missionTrack.accent}`,
                    transition: 'all 0.2s ease',
                    transform: hoveredLang === 'm' + lang.name ? 'translateY(-2px)' : 'translateY(0)',
                    boxShadow: hoveredLang === 'm' + lang.name ? '0 4px 16px rgba(139, 69, 19, 0.1)' : 'none'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                    <div>
                      <div style={{ fontSize: '17px', fontWeight: '600', fontStyle: 'italic', color: '#1A2620' }}>
                        {lang.name}
                      </div>
                      <div style={{ fontSize: '13px', opacity: 0.6, marginTop: '2px' }}>
                        {lang.native}
                      </div>
                    </div>
                    <div style={{
                      fontSize: '9px',
                      letterSpacing: '1.5px',
                      textTransform: 'uppercase',
                      fontWeight: '700',
                      padding: '4px 8px',
                      background: missionTrack.color,
                      color: '#FFFFFF',
                      whiteSpace: 'nowrap'
                    }}>
                      {lang.urgency}
                    </div>
                  </div>
                  <div style={{
                    fontSize: '13px',
                    lineHeight: '1.5',
                    color: '#3D4F47',
                    marginTop: '14px',
                    fontStyle: 'italic'
                  }}>
                    {lang.signal}
                  </div>
                </div>
              ))}
            </div>

            <div style={{
              marginTop: '40px',
              paddingTop: '30px',
              borderTop: `1px solid ${missionTrack.accent}`,
              fontSize: '14px',
              color: '#3D4F47',
              lineHeight: '1.65',
              fontStyle: 'italic'
            }}>
              <strong style={{ color: missionTrack.color, fontStyle: 'normal', letterSpacing: '1px', fontSize: '12px', textTransform: 'uppercase' }}>
                Honest framing
              </strong>
              <p style={{ marginTop: '10px' }}>
                The mission track is not the commercial roadmap. These languages exist for cultural preservation,
                community partnership, and platform values — not for revenue. Treating them as a distinct funding story
                (grants, nonprofit arm, cross-subsidy) is more durable than rolling them into the same growth narrative.
              </p>
            </div>
          </section>
        )}

        {/* Demand signal legend */}
        {!showMissionTrack && currentWave.languages.length > 0 && (
          <section style={{
            marginTop: '40px',
            padding: '24px 32px',
            background: '#FFFFFF',
            border: '1px solid #1A2620'
          }}>
            <div style={{
              fontSize: '10px',
              letterSpacing: '3px',
              color: '#1A2620',
              marginBottom: '14px',
              textTransform: 'uppercase',
              fontWeight: '700'
            }}>
              Reading the urgency tags
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' }}>
              {[
                { label: 'Critical', color: '#C8442D', desc: 'Active language loss happening now, elderly speakers aging out' },
                { label: 'High', color: '#D88842', desc: 'Significant intergenerational gap, transmission at risk' },
                { label: 'Moderate', color: '#6B8E5A', desc: 'Real demand but pace less urgent' },
                { label: 'Low', color: '#8C9B92', desc: 'Aging heritage, transmission already largely broken' }
              ].map(item => (
                <div key={item.label} style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                  <div style={{
                    fontSize: '9px',
                    letterSpacing: '1.5px',
                    textTransform: 'uppercase',
                    fontWeight: '700',
                    padding: '4px 8px',
                    background: item.color,
                    color: '#FFFFFF',
                    whiteSpace: 'nowrap',
                    flexShrink: 0
                  }}>
                    {item.label}
                  </div>
                  <div style={{ fontSize: '12px', color: '#3D4F47', lineHeight: '1.5' }}>
                    {item.desc}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Insights section */}
        <section style={{
          marginTop: '60px',
          padding: '40px 0',
          borderTop: '2px solid #1A2620',
          borderBottom: '2px solid #1A2620'
        }}>
          <div style={{
            fontSize: '10px',
            letterSpacing: '4px',
            color: '#1A2620',
            marginBottom: '32px',
            textTransform: 'uppercase',
            fontWeight: '700',
            textAlign: 'center'
          }}>
            What demand-first analysis surfaced
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '40px' }}>
            <div>
              <div style={{
                fontSize: '14px',
                fontStyle: 'italic',
                color: '#2D5F3F',
                marginBottom: '8px',
                fontWeight: '600'
              }}>
                Tagalog moved up
              </div>
              <p style={{ fontSize: '14px', lineHeight: '1.65', margin: 0, color: '#1A2620' }}>
                Previously placed in Wave 2 for technical conservatism. With 33% of US Tagalog speakers aged 60+,
                Filipino-American grandparents are the demographically purest fit in the entire dataset.
                Belongs in launch.
              </p>
            </div>
            <div>
              <div style={{
                fontSize: '14px',
                fontStyle: 'italic',
                color: '#2D5F3F',
                marginBottom: '8px',
                fontWeight: '600'
              }}>
                Cantonese deserves its own slot
              </div>
              <p style={{ fontSize: '14px', lineHeight: '1.65', margin: 0, color: '#1A2620' }}>
                Treating "Chinese" as one language understates the elderly customer base.
                Cantonese, Hokkien, and Toisanese speakers disproportionately fit the grandparent profile.
                Mandarin alone doesn't reach them.
              </p>
            </div>
            <div>
              <div style={{
                fontSize: '14px',
                fontStyle: 'italic',
                color: '#2D5F3F',
                marginBottom: '8px',
                fontWeight: '600'
              }}>
                European heritage languages moved down
              </div>
              <p style={{ fontSize: '14px', lineHeight: '1.65', margin: 0, color: '#1A2620' }}>
                German, Italian, Dutch, Polish all looked strong on speaker count alone.
                But the demand is past-tense — third-generation transmission largely broken decades ago.
                Real value, contracting market.
              </p>
            </div>
            <div>
              <div style={{
                fontSize: '14px',
                fontStyle: 'italic',
                color: '#8B4513',
                marginBottom: '8px',
                fontWeight: '600'
              }}>
                The mission track is a separate story
              </div>
              <p style={{ fontSize: '14px', lineHeight: '1.65', margin: 0, color: '#1A2620' }}>
                Khmer, K'iche', Nahuatl — these don't appear on a demand-driven roadmap at all.
                That's not a problem. It clarifies that the commercial Babagigi case stands alone,
                and the mission extension is a deliberate choice with its own funding logic.
              </p>
            </div>
          </div>
        </section>

        <footer style={{
          textAlign: 'center',
          marginTop: '50px',
          fontSize: '11px',
          letterSpacing: '3px',
          color: '#3D4F47',
          textTransform: 'uppercase'
        }}>
          Babagigi · Demand-First Language Roadmap · 2026
        </footer>
      </div>
    </div>
  );
}
