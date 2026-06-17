const fs = require('fs');
const tsxPath = 'C:/projects/My SAas/super-app/src/app/apex/ApexGatewayClient.tsx';
let tsx = fs.readFileSync(tsxPath, 'utf-8');

const mockupsCode = `
// ==========================================
// HIGH-FIDELITY CODE-BASED UI MOCKUPS
// ==========================================

const DashboardMockup = () => (
  <div style={{ width: '100%', height: '100%', background: '#09090b', color: '#fff', display: 'flex', fontFamily: 'var(--mono-font), sans-serif', fontSize: '10px' }}>
    <div style={{ width: '22%', background: '#040405', borderRight: '1px solid rgba(255,255,255,0.05)', padding: '16px' }}>
      <div style={{ fontSize: '14px', fontWeight: 800, color: 'var(--apex-gold)', marginBottom: '24px', letterSpacing: '1px' }}>APEX OS</div>
      {['Dashboard', 'Admissions', 'Student Directory', 'HR Management', 'Finance Ledger', 'Settings'].map((item, i) => (
        <div key={i} style={{ padding: '10px', background: i === 0 ? 'rgba(201,168,76,0.1)' : 'transparent', color: i === 0 ? 'var(--apex-gold)' : '#888', borderLeft: i === 0 ? '2px solid var(--apex-gold)' : '2px solid transparent', marginBottom: '4px', borderRadius: '0 4px 4px 0' }}>{item}</div>
      ))}
    </div>
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
      <div style={{ height: '50px', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 24px' }}>
        <div style={{ color: '#888' }}>Overview / <span style={{color: '#fff'}}>Admin Dashboard</span></div>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <div style={{ background: 'rgba(255,255,255,0.05)', padding: '6px 12px', borderRadius: '4px', color: '#666' }}>Search records...</div>
          <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: 'linear-gradient(135deg, var(--apex-gold), #fff)' }} />
        </div>
      </div>
      <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px', height: '100%' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' }}>
          {[
            { label: 'Total Students', val: '2,450', trend: '+12%' },
            { label: 'Active Staff', val: '124', trend: '+2%' },
            { label: 'Monthly Revenue', val: 'Rs. 4.5M', trend: '+8%' },
            { label: 'Avg Attendance', val: '94.2%', trend: '-1%' }
          ].map((stat, i) => (
            <div key={i} style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', padding: '16px', borderRadius: '8px' }}>
              <div style={{ color: '#888', marginBottom: '8px' }}>{stat.label}</div>
              <div style={{ fontSize: '20px', fontWeight: 700 }}>{stat.val}</div>
              <div style={{ color: stat.trend.includes('+') ? '#27c93f' : '#ff5f56', marginTop: '8px', fontSize: '9px' }}>{stat.trend} this month</div>
            </div>
          ))}
        </div>
        <div style={{ flex: 1, background: 'rgba(255,255,255,0.01)', border: '1px solid rgba(255,255,255,0.03)', borderRadius: '8px', padding: '16px', display: 'flex', flexDirection: 'column' }}>
          <div style={{ marginBottom: '16px', color: '#888' }}>Admissions Growth (2026)</div>
          <div style={{ flex: 1, display: 'flex', alignItems: 'flex-end', gap: '8px' }}>
            {[30, 45, 25, 60, 75, 50, 90, 100, 85, 70, 95, 80].map((h, i) => (
              <div key={i} style={{ flex: 1, background: i === 7 ? 'var(--apex-gold)' : 'rgba(255,255,255,0.1)', height: \`\${h}%\`, borderRadius: '4px 4px 0 0' }} />
            ))}
          </div>
        </div>
      </div>
    </div>
  </div>
);

const ForgeMockup = () => (
  <div style={{ width: '100%', height: '100%', background: '#09090b', color: '#fff', display: 'flex', flexDirection: 'column', fontFamily: 'var(--mono-font), sans-serif', fontSize: '10px' }}>
    <div style={{ padding: '20px 24px', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <div>
        <div style={{ fontSize: '14px', fontWeight: 800, color: '#fff' }}>Academic Forge</div>
        <div style={{ color: '#888', marginTop: '4px' }}>AI Paper Generator</div>
      </div>
      <div style={{ background: 'var(--apex-gold)', color: '#000', padding: '8px 16px', borderRadius: '4px', fontWeight: 700 }}>Generate PDF</div>
    </div>
    <div style={{ display: 'flex', flex: 1 }}>
      <div style={{ width: '25%', borderRight: '1px solid rgba(255,255,255,0.05)', padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {['Class: Grade 10', 'Subject: Physics', 'Difficulty: Advanced', 'Format: Objective & Subjective', 'Total Marks: 50'].map((opt, i) => (
          <div key={i}>
            <div style={{ color: '#888', marginBottom: '6px', fontSize: '9px' }}>{opt.split(':')[0]}</div>
            <div style={{ background: 'rgba(255,255,255,0.05)', padding: '10px', borderRadius: '4px', color: '#fff' }}>{opt.split(':')[1]}</div>
          </div>
        ))}
      </div>
      <div style={{ flex: 1, padding: '24px', overflow: 'hidden' }}>
        <div style={{ background: '#fff', color: '#000', height: '100%', borderRadius: '4px', padding: '32px', fontFamily: '"Times New Roman", serif' }}>
          <div style={{ textAlign: 'center', fontSize: '16px', fontWeight: 'bold', marginBottom: '24px', borderBottom: '2px solid #000', paddingBottom: '12px' }}>
            GRADE 10 - PHYSICS FINAL EXAM
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', fontSize: '12px' }}>
            <div><strong>Q1. Multiple Choice Questions (10 Marks)</strong></div>
            <div>i. Which of the following represents the correct formula for...</div>
            <div>ii. The SI unit of electrical resistance is:</div>
            <div style={{ marginTop: '16px' }}><strong>Q2. Short Answer Questions (20 Marks)</strong></div>
            <div>a) Define the laws of thermodynamics with examples. (5)</div>
            <div>b) Calculate the velocity of an object falling from 100m. (5)</div>
          </div>
        </div>
      </div>
    </div>
  </div>
);

const FinanceMockup = () => (
  <div style={{ width: '100%', height: '100%', background: '#09090b', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
    <div style={{ width: '100%', display: 'flex', gap: '16px', height: '100%' }}>
      {['BANK COPY', 'SCHOOL COPY', 'STUDENT COPY'].map((title, index) => (
        <div key={index} style={{ flex: 1, background: '#fff', color: '#000', borderRadius: '8px', padding: '16px', display: 'flex', flexDirection: 'column', position: 'relative', boxShadow: '0 10px 30px rgba(0,0,0,0.5)' }}>
          <div style={{ textAlign: 'center', borderBottom: '2px dashed #ccc', paddingBottom: '12px', marginBottom: '12px' }}>
            <div style={{ fontWeight: 800, fontSize: '10px', marginBottom: '4px' }}>AL-SIDDIQUE SCHOLARS</div>
            <div style={{ fontSize: '8px', color: '#666' }}>{title}</div>
            <div style={{ fontSize: '8px', marginTop: '6px' }}>Due Date: 15 June 2026</div>
          </div>
          <div style={{ fontSize: '8px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Student:</span> <strong>Ali Khan</strong></div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Class:</span> <strong>Grade 10 - A</strong></div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Challan ID:</span> <strong>#99482</strong></div>
          </div>
          <div style={{ marginTop: '16px', borderTop: '1px solid #eee', paddingTop: '12px', fontSize: '8px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold' }}><span>Particulars</span><span>Amount</span></div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Tuition Fee</span><span>Rs. 4,500</span></div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Lab Charges</span><span>Rs. 500</span></div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Arrears</span><span>Rs. 0</span></div>
          </div>
          <div style={{ marginTop: 'auto', borderTop: '2px dashed #ccc', paddingTop: '12px', display: 'flex', justifyContent: 'space-between', fontWeight: 800, fontSize: '10px' }}>
            <span>TOTAL:</span><span>Rs. 5,000</span>
          </div>
          <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%) rotate(-25deg)', border: '3px solid rgba(201, 168, 76, 0.4)', color: 'rgba(201, 168, 76, 0.4)', padding: '4px 12px', fontSize: '16px', fontWeight: 800, letterSpacing: '4px', borderRadius: '4px', pointerEvents: 'none' }}>
            PAID
          </div>
        </div>
      ))}
    </div>
  </div>
);

const ConnectMockup = () => (
  <div style={{ width: '100%', height: '100%', background: '#040405', color: '#fff', fontFamily: 'var(--mono-font), sans-serif', display: 'flex', flexDirection: 'column' }}>
    <div style={{ padding: '24px 20px', background: 'linear-gradient(180deg, rgba(201,168,76,0.15) 0%, transparent 100%)', display: 'flex', alignItems: 'center', gap: '16px' }}>
      <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: '#fff', border: '2px solid var(--apex-gold)' }} />
      <div>
        <div style={{ fontSize: '16px', fontWeight: 800 }}>Ali Khan</div>
        <div style={{ fontSize: '12px', color: 'var(--apex-gold)', marginTop: '4px' }}>Grade 10 - Section A</div>
      </div>
    </div>
    <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '16px', padding: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <div style={{ fontSize: '12px', color: '#888' }}>Attendance (May)</div>
          <div style={{ fontSize: '24px', fontWeight: 800, marginTop: '8px' }}>94%</div>
        </div>
        <div style={{ width: '60px', height: '60px', borderRadius: '50%', border: '6px solid var(--apex-gold)', borderTopColor: 'rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>24/26</div>
      </div>
      <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '16px', padding: '20px' }}>
        <div style={{ fontSize: '12px', color: 'var(--apex-gold)', fontWeight: 'bold', marginBottom: '12px' }}>LATEST NOTICE</div>
        <div style={{ fontSize: '14px', lineHeight: 1.5 }}>Physics Mid-Term Exam scheduled for June 5th. Please ensure all fee challans are cleared.</div>
        <div style={{ fontSize: '10px', color: '#666', marginTop: '12px' }}>Today, 10:45 AM</div>
      </div>
      <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '16px', padding: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
         <div>
          <div style={{ fontSize: '12px', color: '#888' }}>Fee Status</div>
          <div style={{ fontSize: '16px', fontWeight: 800, marginTop: '4px' }}>Rs. 5,000</div>
         </div>
         <div style={{ background: 'rgba(39, 201, 63, 0.2)', color: '#27c93f', padding: '6px 12px', borderRadius: '20px', fontSize: '10px', fontWeight: 'bold' }}>PAID</div>
      </div>
    </div>
  </div>
);

const CommandCenterMockup = () => (
  <div style={{ width: '100%', height: '100%', background: '#000', padding: '24px', display: 'flex', flexDirection: 'column', gap: '24px', fontFamily: 'var(--mono-font), sans-serif', color: '#fff' }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '16px' }}>
      <div>
        <div style={{ fontSize: '16px', fontWeight: 800 }}>Identity Studio</div>
        <div style={{ fontSize: '10px', color: '#666', marginTop: '4px' }}>Global Settings & ID Card Generation</div>
      </div>
      <div style={{ padding: '8px 16px', background: 'rgba(255,255,255,0.1)', borderRadius: '4px', fontSize: '10px' }}>Batch Generate</div>
    </div>
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', flex: 1 }}>
      {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
        <div key={i} style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '8px', padding: '16px', display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '40px', background: 'var(--apex-navy-2)' }} />
          <div style={{ width: '50px', height: '50px', borderRadius: '50%', background: '#fff', zIndex: 2, border: '2px solid #000', marginBottom: '12px' }} />
          <div style={{ fontSize: '12px', fontWeight: 'bold' }}>Student {i}</div>
          <div style={{ fontSize: '9px', color: 'var(--apex-gold)', marginBottom: '16px' }}>ID: APX-99{i}2</div>
          <div style={{ width: '100%', height: '30px', background: 'repeating-linear-gradient(90deg, #fff, #fff 2px, transparent 2px, transparent 4px)', opacity: 0.5, marginTop: 'auto' }} />
        </div>
      ))}
    </div>
  </div>
);
`;

if (!tsx.includes('const DashboardMockup')) {
  tsx = tsx.replace('export default function ApexGatewayClient() {', mockupsCode + '\nexport default function ApexGatewayClient() {');
}

// Ensure img tags are replaced by these components
tsx = tsx.replace(
  /{screenshotSrc && \(\s*<img src=\{screenshotSrc\} alt=\{title\} className="mock-screenshot-img" \/>\s*\)}/g,
  `{screenshotSrc === '/apex/screenshots/dashboard.png' && <DashboardMockup />}
      {screenshotSrc === '/apex/screenshots/paper-generator.png' && <ForgeMockup />}
      {screenshotSrc === '/apex/screenshots/fees.png' && <FinanceMockup />}
      {screenshotSrc === '/apex/screenshots/identity-studio.png' && <CommandCenterMockup />}`
);

tsx = tsx.replace(
  /<img\s*src=\{mobileScreens\[activeScreenIndex\]\.src\}\s*alt=\{mobileScreens\[activeScreenIndex\]\.title\}\s*className="screenshot-base-img mobile-screenshot mock-screenshot-img"\s*\/>/g,
  `<ConnectMockup />`
);

// Address empty spaces issue in the layout (the 100vh issue)
// Also ensure device frames display correctly and don't collapse if there's no img tag.
tsx = tsx.replace(/minHeight: '120vh'/g, "minHeight: '100vh'");
// Removing the excessive padding
// The CSS file might need an update too if empty space remains.
fs.writeFileSync(tsxPath, tsx);
console.log('Premium mockups injected and img tags replaced!');
