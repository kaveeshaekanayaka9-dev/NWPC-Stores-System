import React, { useState, useEffect } from 'react';
import axios from 'axios';

const GraphicalRack = () => {
  const [selectedRack, setSelectedRack] = useState('Rack 01');
  const [rackData, setRackData] = useState({
    'shelf 04': Array(8).fill(null),
    'shelf 03': Array(8).fill(null),
    'shelf 02': Array(8).fill(null),
    'shelf 01': Array(8).fill(null)
  });
  const [loading, setLoading] = useState(false);

  const shelves = ['shelf 04', 'shelf 03', 'shelf 02', 'shelf 01'];

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

  const [hoveredFile, setHoveredFile] = useState(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e) => {
    setMousePos({ x: e.clientX, y: e.clientY });
  };

  return (
    <div style={styles.container} onMouseMove={handleMouseMove}>
      <div style={styles.header}>
        <h2 style={styles.title}>🗄️ Interactive Graphical Rack Layout</h2>
        <p style={styles.subtitle}>View physical file placements across different racks in the storage.</p>
      </div>

      <div style={styles.controls}>
        <label style={styles.label}>Select Rack Location:</label>
        <select style={styles.dropdown} value={selectedRack} onChange={(e) => setSelectedRack(e.target.value)}>
          <option value="Rack 01">Rack 01 (General Files)</option>
          <option value="Rack 02">Rack 02 (Account Files)</option>
          <option value="Rack 03">Rack 03 (Legal Documents)</option>
          <option value="Rack 04">Rack 04 (Establishment)</option>
          <option value="Rack 05">Rack 05 (Miscellaneous)</option>
        </select>
      </div>

      <div style={styles.rackContainer}>
        {loading ? (
          <div style={styles.loading}>Loading rack data...</div>
        ) : (
          <div style={styles.rackGrid}>
            {shelves.map((shelf) => (
              <div key={shelf} style={styles.shelfRow}>
                <div style={styles.shelfLabel}>{shelf.toUpperCase()}</div>
                <div style={styles.slotsContainer}>
                  {(rackData[shelf] || Array(8).fill(null)).map((slotData, index) => {
                    const isOccupied = slotData !== null && slotData !== 0 && slotData !== undefined;
                    return (
                      <div 
                        key={index} 
                        style={{ ...styles.slotBox, 
                                 border: isOccupied ? '2px solid #10b981' : '2px dashed #94a3b8',
                                 background: isOccupied ? 'rgba(16, 185, 129, 0.1)' : 'transparent' 
                               }}
                        onMouseEnter={() => isOccupied && setHoveredFile(slotData)}
                        onMouseLeave={() => setHoveredFile(null)}
                      >
                        {isOccupied ? (
                          <div style={styles.fileIcon}>📄</div>
                        ) : (
                          <span style={styles.emptyText}>Empty</span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {hoveredFile && (
        <div style={{
          ...styles.tooltip,
          top: mousePos.y + 15,
          left: mousePos.x + 15,
        }}>
          <div style={styles.tooltipHeader}>File Details</div>
          <div style={styles.tooltipBody}>
            <p style={styles.tooltipP}><strong>Name:</strong> {hoveredFile.fileName}</p>
            <p style={styles.tooltipP}><strong>Number:</strong> {hoveredFile.fileNumber}</p>
            <p style={styles.tooltipP}><strong>Category:</strong> {hoveredFile.category}</p>
            <p style={styles.tooltipP}><strong>Submitted By:</strong> {hoveredFile.submittedBy}</p>
            <p style={styles.tooltipP}><strong>Location:</strong> {hoveredFile.rackNumber} / {hoveredFile.shelfNumber} / Slot {hoveredFile.slotIndex || 'N/A'}</p>
            <p style={styles.tooltipP}><strong>Status:</strong> {hoveredFile.isVerified}</p>
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
  rackContainer: { background: '#fff', padding: '40px', borderRadius: '16px', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.05)', border: '1px solid #e2e8f0' },
  loading: { textAlign: 'center', padding: '50px', color: '#64748b', fontSize: '18px' },
  rackGrid: { display: 'flex', flexDirection: 'column', gap: '25px' },
  shelfRow: { display: 'flex', alignItems: 'center', gap: '20px', background: '#f8fafc', padding: '15px', borderRadius: '12px', border: '1px solid #e2e8f0' },
  shelfLabel: { width: '100px', fontSize: '14px', fontWeight: '700', color: '#475569', letterSpacing: '1px' },
  slotsContainer: { flex: 1, display: 'flex', gap: '15px' },
  slotBox: { flex: 1, height: '90px', borderRadius: '8px', display: 'flex', justifyContent: 'center', alignItems: 'center', cursor: 'pointer', transition: 'all 0.2s ease', position: 'relative' },
  fileIcon: { fontSize: '32px', filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))' },
  emptyText: { fontSize: '12px', color: '#cbd5e1', fontWeight: '600', textTransform: 'uppercase' },
  tooltip: { position: 'fixed', zIndex: 1000, background: 'rgba(15, 23, 42, 0.95)', color: '#fff', padding: '0', borderRadius: '12px', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.2), 0 10px 10px -5px rgba(0, 0, 0, 0.1)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.1)', width: '320px', pointerEvents: 'none' },
  tooltipHeader: { background: 'rgba(255,255,255,0.1)', padding: '12px 15px', borderTopLeftRadius: '12px', borderTopRightRadius: '12px', fontSize: '14px', fontWeight: '700', borderBottom: '1px solid rgba(255,255,255,0.05)' },
  tooltipBody: { padding: '15px', fontSize: '13px', lineHeight: '1.6' },
  tooltipP: { margin: '0 0 8px 0' }
};

export default GraphicalRack;