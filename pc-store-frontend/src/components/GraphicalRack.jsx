import React, { useState, useEffect } from 'react';
import axios from 'axios';

const GraphicalRack = () => {
  const [selectedRack, setSelectedRack] = useState('Rack 01');
  const [rackData, setRackData] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchRackData = async () => {
      setLoading(true);
      try {
        const response = await axios.get(`http://localhost:5000/api/racks/${selectedRack}`);
        setRackData(response.data);
      } catch (err) {
        console.error("API Error:", err);
      }
      setLoading(false);
    }
    fetchRackData();
  }, [selectedRack]);

  const [hoveredSlotFiles, setHoveredSlotFiles] = useState(null);
  const [hoveredAdNumber, setHoveredAdNumber] = useState(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e) => {
    setMousePos({ x: e.clientX, y: e.clientY });
  };

  // Calculate the rack index from the selected rack name (e.g., "Rack 01" -> 0, "Rack 03" -> 2)
  const getRackIndex = (rackName) => {
    const num = parseInt(rackName.split(' ')[1], 10);
    return isNaN(num) ? 0 : num - 1;
  };

  // Generate the fixed 8 shelves with permanent year labels
  const BASE_YEAR = 2010;
  const SHELVES_PER_RACK = 8;
  const fixedShelves = Array.from({ length: SHELVES_PER_RACK }, (_, i) => {
    const shelfIndex = SHELVES_PER_RACK - 1 - i; // Shelf 08 at top, Shelf 01 at bottom
    const shelfNum = `Shelf 0${shelfIndex + 1}`;
    const year = BASE_YEAR + (getRackIndex(selectedRack) * SHELVES_PER_RACK) + shelfIndex;
    return { shelfNum, year };
  });

  return (
    <div style={styles.container} onMouseMove={handleMouseMove}>
      <div style={styles.header}>
        <h2 style={styles.title}>🗄️ Interactive Graphical Rack Layout</h2>
        <p style={styles.subtitle}>View physical file placements across different racks in the storage.</p>
      </div>

      <div style={styles.controls}>
        <label style={styles.label}>Select Rack Location:</label>
        <select style={styles.dropdown} value={selectedRack} onChange={(e) => setSelectedRack(e.target.value)}>
          <option value="Rack 01">Rack 01 (2010 - 2017)</option>
          <option value="Rack 02">Rack 02 (2018 - 2025)</option>
          <option value="Rack 03">Rack 03 (2026 - 2033)</option>
          <option value="Rack 04">Rack 04 (2034 - 2041)</option>
          <option value="Rack 05">Rack 05 (2042 - 2049)</option>
        </select>
      </div>

      <div style={styles.rackContainer}>
        {loading ? (
          <div style={styles.loading}>Loading rack data...</div>
        ) : (
          <div style={styles.rackGrid}>
            {fixedShelves.map(({ shelfNum, year }) => {
              const shelfData = rackData[shelfNum] || Array.from({ length: 24 }, () => []);
              // Calculate total files in this shelf for the shelf-level summary
              const totalShelfFiles = shelfData.reduce((sum, slot) => sum + (slot ? slot.length : 0), 0);
              return (
                <div key={shelfNum} style={styles.shelfRow}>
                  <div style={styles.shelfLabel}>
                    <div style={{ fontSize: '11px', fontWeight: '800', color: '#0f172a' }}>{shelfNum.toUpperCase()}</div>
                    <div style={{ fontSize: '13px', fontWeight: '700', color: '#10b981', marginTop: '2px' }}>({year})</div>
                    <div style={{ fontSize: '10px', color: '#64748b', marginTop: '4px' }}>📁 {totalShelfFiles}</div>
                  </div>
                  <div style={styles.slotsContainer}>
                    {shelfData.map((slotFiles, index) => {
                      const adNum = (index + 1).toString().padStart(2, '0');
                      const fileCount = slotFiles ? slotFiles.length : 0;
                      const isOccupied = fileCount > 0;
                      const MAX_CAPACITY = 5;
                      const fillPercent = Math.min((fileCount / MAX_CAPACITY) * 100, 100);

                      // Color gradient: 0=transparent, 1=green, 2=amber, 3=orange, 4+=red
                      let slotBg = 'transparent';
                      let slotBorder = '2px dashed #94a3b8';
                      let barColor = '#10b981';
                      if (fileCount === 1) {
                        slotBg = 'rgba(16, 185, 129, 0.1)';
                        slotBorder = '2px solid #10b981';
                        barColor = '#10b981';
                      } else if (fileCount === 2) {
                        slotBg = 'rgba(245, 158, 11, 0.12)';
                        slotBorder = '2px solid #f59e0b';
                        barColor = '#f59e0b';
                      } else if (fileCount === 3) {
                        slotBg = 'rgba(249, 115, 22, 0.15)';
                        slotBorder = '2px solid #f97316';
                        barColor = '#f97316';
                      } else if (fileCount >= 4) {
                        slotBg = 'rgba(239, 68, 68, 0.15)';
                        slotBorder = '2px solid #ef4444';
                        barColor = '#ef4444';
                      }

                      return (
                        <div 
                          key={index} 
                          style={{ ...styles.slotBox, 
                                   border: slotBorder,
                                   background: slotBg 
                                 }}
                          onMouseEnter={() => {
                            if (isOccupied) {
                              setHoveredSlotFiles(slotFiles);
                              setHoveredAdNumber(adNum);
                            }
                          }}
                          onMouseLeave={() => {
                            setHoveredSlotFiles(null);
                            setHoveredAdNumber(null);
                          }}
                        >
                          <div style={styles.adLabel}>AD/{adNum}</div>
                          {isOccupied ? (
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px', marginTop: '8px' }}>
                              <div style={{ fontSize: '16px', filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.1))', position: 'relative' }}>
                                <span style={{ position: 'absolute', top: '-10px', right: '-12px', background: barColor, color: 'white', borderRadius: '50%', fontSize: '9px', width: '16px', height: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>{fileCount}</span>
                                📄
                              </div>
                              {/* Capacity Progress Bar */}
                              <div style={{ width: '80%', height: '4px', background: '#e2e8f0', borderRadius: '2px', overflow: 'hidden', marginTop: '4px' }}>
                                <div style={{ width: `${fillPercent}%`, height: '100%', background: barColor, borderRadius: '2px', transition: 'width 0.3s ease' }}></div>
                              </div>
                              <span style={{ fontSize: '8px', color: '#64748b', fontWeight: '600' }}>{fileCount}/{MAX_CAPACITY}</span>
                            </div>
                          ) : (
                            <span style={styles.emptyText}>Empty</span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {hoveredSlotFiles && (
        <div style={{
          ...styles.tooltip,
          top: mousePos.y + 15,
          left: mousePos.x + 15,
        }}>
          <div style={styles.tooltipHeader}>Slot AD/{hoveredAdNumber} - Files ({hoveredSlotFiles.length})</div>
          <div style={styles.tooltipBody}>
            {hoveredSlotFiles.map((file, idx) => (
              <div key={idx} style={{ marginBottom: '10px', paddingBottom: '10px', borderBottom: idx < hoveredSlotFiles.length - 1 ? '1px solid rgba(255,255,255,0.1)' : 'none' }}>
                <p style={styles.tooltipP}><strong>Name:</strong> {file.fileName}</p>
                <p style={styles.tooltipP}><strong>Number:</strong> {file.fileNumber}</p>
                <p style={styles.tooltipP}><strong>Year:</strong> {file.year}</p>
                <p style={styles.tooltipP}><strong>Status:</strong> {file.isVerified}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

const styles = {
  container: { padding: '30px', fontFamily: '"Inter", "Segoe UI", sans-serif', backgroundColor: '#f8fafc', minHeight: '100vh', color: '#1e293b' },
  header: { marginBottom: '30px' },
  title: { fontSize: '28px', fontWeight: '800', color: '#0f172a', margin: '0 0 10px 0' },
  subtitle: { color: '#64748b', margin: 0, fontSize: '16px' },
  controls: { display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '30px', background: '#fff', padding: '20px', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)' },
  label: { fontWeight: '600', color: '#334155' },
  dropdown: { padding: '10px 15px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '15px', outline: 'none', background: '#f1f5f9', cursor: 'pointer', minWidth: '250px' },
  rackContainer: { background: '#fff', padding: '20px', borderRadius: '16px', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.05)', border: '1px solid #e2e8f0', overflowX: 'auto' },
  loading: { textAlign: 'center', padding: '50px', color: '#64748b', fontSize: '18px' },
  rackGrid: { display: 'flex', flexDirection: 'column', gap: '25px', minWidth: '1200px' },
  shelfRow: { display: 'flex', alignItems: 'center', gap: '15px', background: '#f8fafc', padding: '15px', borderRadius: '12px', border: '1px solid #e2e8f0' },
  shelfLabel: { width: '100px', fontSize: '12px', fontWeight: '700', color: '#475569', letterSpacing: '1px', flexShrink: 0, textAlign: 'center' },
  slotsContainer: { flex: 1, display: 'flex', gap: '8px' },
  slotBox: { flex: 1, height: '80px', borderRadius: '6px', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', cursor: 'pointer', transition: 'all 0.2s ease', position: 'relative', minWidth: '40px' },
  adLabel: { position: 'absolute', top: '2px', left: '2px', fontSize: '9px', fontWeight: 'bold', color: '#64748b' },
  fileIcon: { fontSize: '24px', filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))', position: 'relative', marginTop: '10px' },
  badge: { position: 'absolute', top: '-8px', right: '-8px', background: '#ef4444', color: 'white', borderRadius: '50%', fontSize: '10px', width: '16px', height: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' },
  emptyText: { fontSize: '10px', color: '#cbd5e1', fontWeight: '600', textTransform: 'uppercase', marginTop: '10px' },
  tooltip: { position: 'fixed', zIndex: 1000, background: 'rgba(15, 23, 42, 0.95)', color: '#fff', padding: '0', borderRadius: '12px', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.2), 0 10px 10px -5px rgba(0, 0, 0, 0.1)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.1)', width: '300px', pointerEvents: 'none', maxHeight: '400px', overflowY: 'auto' },
  tooltipHeader: { background: 'rgba(255,255,255,0.1)', padding: '12px 15px', borderTopLeftRadius: '12px', borderTopRightRadius: '12px', fontSize: '14px', fontWeight: '700', borderBottom: '1px solid rgba(255,255,255,0.05)', position: 'sticky', top: 0 },
  tooltipBody: { padding: '15px', fontSize: '12px', lineHeight: '1.5' },
  tooltipP: { margin: '0 0 4px 0' }
};

export default GraphicalRack;