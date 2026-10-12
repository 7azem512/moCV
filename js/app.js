/**
 * Portfolio Engine - Eng. Mohamed Ali Khattab
 * Clean Professional Electromechanical Engineering Portfolio
 */

// Default to English
let currentLang = 'en';
try {
  const saved = localStorage.getItem('preferredLang');
  if (saved === 'ar' || saved === 'en') {
    currentLang = saved;
  } else {
    currentLang = 'en';
    localStorage.setItem('preferredLang', 'en');
  }
} catch (e) {
  currentLang = 'en';
}

let activeFilter = 'all';
let soundEnabled = false;

// Audio Synthesizer (subtle, optional)
const playUiSound = (type = 'click') => {
  if (!soundEnabled) return;
  try {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);

    if (type === 'click') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(600, ctx.currentTime);
      gain.gain.setValueAtTime(0.04, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.04);
      osc.start();
      osc.stop(ctx.currentTime + 0.04);
    }
  } catch (e) {}
};

// Initialize Application
document.addEventListener('DOMContentLoaded', () => {
  initLanguage();
  initNavbar();
  initScrollProgress();
  initScrollReveal();
  initCounters();
  renderProjects();
  renderTimeline();
  renderTraining();
  renderSkills();
  initInteractiveWidget();
  initModals();
});

/* -----------------------------------------------------------
   1. Language Switcher (Default: English)
----------------------------------------------------------- */
function initLanguage() {
  const langToggleBtn = document.getElementById('langToggle');
  setLanguage(currentLang);

  if (langToggleBtn) {
    langToggleBtn.addEventListener('click', () => {
      currentLang = currentLang === 'en' ? 'ar' : 'en';
      try { localStorage.setItem('preferredLang', currentLang); } catch (e) {}
      setLanguage(currentLang);
      playUiSound('click');
    });
  }
}

function setLanguage(lang) {
  currentLang = lang;
  document.documentElement.setAttribute('lang', lang);
  document.documentElement.setAttribute('dir', lang === 'ar' ? 'rtl' : 'ltr');
  document.body.classList.toggle('rtl-mode', lang === 'ar');
  document.body.classList.toggle('ltr-mode', lang === 'en');

  const langLabel = document.getElementById('currentLangLabel');
  if (langLabel) {
    langLabel.textContent = lang === 'en' ? 'عربي' : 'EN';
  }

  // Update static text elements with data-i18n
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.getAttribute('data-i18n');
    const text = getNestedTranslation(translations[lang], key);
    if (text) el.innerHTML = text;
  });

  // Re-render dynamic sections
  renderProjects();
  renderTimeline();
  renderTraining();
  renderSkills();
  updateInteractiveWidgetLang();
}

function getNestedTranslation(obj, path) {
  return path.split('.').reduce((acc, part) => acc && acc[part], obj);
}

/* -----------------------------------------------------------
   2. Navbar & Mobile Drawer
----------------------------------------------------------- */
function initNavbar() {
  const navbar = document.getElementById('navbar');
  const mobileMenuBtn = document.getElementById('mobileMenuBtn');
  const mobileMenu = document.getElementById('mobileMenu');

  window.addEventListener('scroll', () => {
    if (window.scrollY > 40) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  });

  if (mobileMenuBtn && mobileMenu) {
    mobileMenuBtn.addEventListener('click', () => {
      mobileMenu.classList.toggle('open');
      const icon = mobileMenuBtn.querySelector('i');
      if (icon) {
        icon.className = mobileMenu.classList.contains('open') ? 'ph-bold ph-x' : 'ph-bold ph-list';
      }
      playUiSound('click');
    });

    mobileMenu.querySelectorAll('.nav-link').forEach(link => {
      link.addEventListener('click', () => {
        mobileMenu.classList.remove('open');
        const icon = mobileMenuBtn.querySelector('i');
        if (icon) icon.className = 'ph-bold ph-list';
      });
    });
  }
}

/* -----------------------------------------------------------
   3. Scroll Progress Bar
----------------------------------------------------------- */
function initScrollProgress() {
  const bar = document.getElementById('scrollProgress');
  if (!bar) return;

  window.addEventListener('scroll', () => {
    const scrollTop = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const percent = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
    bar.style.width = `${percent}%`;
  });
}

/* -----------------------------------------------------------
   4. Smooth Scroll Reveal Animations
----------------------------------------------------------- */
function initScrollReveal() {
  const revealElements = document.querySelectorAll('.reveal, .reveal-stagger');

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
      }
    });
  }, { threshold: 0.15 });

  revealElements.forEach(el => observer.observe(el));
}

/* -----------------------------------------------------------
   5. Dynamic KPI Counters
----------------------------------------------------------- */
function initCounters() {
  const counterElements = document.querySelectorAll('.counter-val');
  let animated = false;

  const statsSection = document.getElementById('statsGrid');
  if (!statsSection) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting && !animated) {
        animated = true;
        animateNumbers();
      }
    });
  }, { threshold: 0.3 });

  observer.observe(statsSection);

  function animateNumbers() {
    counterElements.forEach(el => {
      const target = el.getAttribute('data-target');
      if (!target) return;

      const numPart = parseInt(target.replace(/[^0-9]/g, '')) || 0;
      let current = 0;
      const duration = 1200;
      const stepTime = 30;
      const steps = duration / stepTime;
      const increment = numPart / steps;

      const timer = setInterval(() => {
        current += increment;
        if (current >= numPart) {
          clearInterval(timer);
          el.textContent = target;
        } else {
          if (target.includes('+')) {
            el.textContent = `${Math.floor(current)}+`;
          } else if (target.includes('%')) {
            el.textContent = `${Math.floor(current)}%`;
          } else {
            el.textContent = `${Math.floor(current)}`;
          }
        }
      }, stepTime);
    });
  }
}

/* -----------------------------------------------------------
   6. Projects Showcase (Exact matching with style.css)
----------------------------------------------------------- */
function renderProjects() {
  const container = document.getElementById('projectsGrid');
  if (!container) return;

  const t = translations[currentLang].projects;
  const items = t.items;

  const filtered = items.filter(item => {
    if (activeFilter === 'all') return true;
    if (activeFilter === 'stations') return item.id.includes('station');
    if (activeFilter === 'electrical') return item.specs.voltage || item.specs.electrical;
    if (activeFilter === 'mep') return item.specs.systems || item.highlights.some(h => h.includes('Fire') || h.includes('حريق') || h.includes('HVAC'));
    return true;
  });

  const isAr = currentLang === 'ar';

  container.innerHTML = filtered.map(item => `
    <article class="project-card card" data-project-id="${item.id}">
      <div>
        <div class="pcard-top">
          <span class="pcard-badge">${item.badge}</span>
          <span class="pcard-period">${item.period}</span>
        </div>

        <div class="pcard-company">${item.company}</div>
        <h3 class="pcard-title">${item.title}</h3>
        <p class="pcard-sub">${item.project}</p>
        <p class="pcard-scope">${item.scope}</p>

        <div class="pcard-specs">
          ${Object.entries(item.specs).map(([key, val]) => `
            <div class="spec-row">
              <span class="spec-key">${formatSpecLabel(key)}</span>
              <span class="spec-val">${val}</span>
            </div>
          `).join('')}
        </div>

        <ul class="pcard-highlights">
          ${item.highlights.slice(0, 3).map(h => `
            <li><i class="ph-bold ph-check-circle"></i><span>${h}</span></li>
          `).join('')}
        </ul>
      </div>

      <div class="pcard-actions">
        <button class="btn btn-primary btn-sm open-project-modal" data-id="${item.id}">
          <i class="ph-bold ph-magnifying-glass-plus"></i>${isAr ? 'التفاصيل الهندسية' : 'Full Scope'}
        </button>
        <a href="https://wa.me/201064888996?text=${encodeURIComponent((isAr ? 'مرحباً م. محمد، استفسار بخصوص ' : 'Hello Eng. Mohamed, inquiring about ') + item.title)}" target="_blank" class="btn btn-outline btn-sm">
          <i class="ph-bold ph-whatsapp-logo"></i>${isAr ? 'واتساب' : 'Inquire'}
        </a>
      </div>
    </article>
  `).join('');

  container.querySelectorAll('.open-project-modal').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const id = e.currentTarget.getAttribute('data-id');
      openProjectModal(id);
      playUiSound('click');
    });
  });

  initProjectFilters();
}

function formatSpecLabel(key) {
  const isAr = currentLang === 'ar';
  const map = {
    pumps: isAr ? 'المضخات' : 'Pumps',
    voltage: isAr ? 'الجهد' : 'Voltage',
    control: isAr ? 'التحكم' : 'Control',
    inspections: isAr ? 'الاعتمادات' : 'Inspections',
    systems: isAr ? 'المنظومات' : 'Systems',
    electrical: isAr ? 'الكهرباء' : 'Electrical',
    type: isAr ? 'النوع' : 'Type',
    focus: isAr ? 'التركيز' : 'Focus',
    standards: isAr ? 'المعايير' : 'Standards'
  };
  return map[key] || key;
}

function initProjectFilters() {
  const buttons = document.querySelectorAll('.filter-btn');
  buttons.forEach(btn => {
    btn.addEventListener('click', () => {
      buttons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      activeFilter = btn.getAttribute('data-filter');
      renderProjects();
      playUiSound('click');
    });
  });
}

/* -----------------------------------------------------------
   7. Timeline (Exact matching with style.css)
----------------------------------------------------------- */
function renderTimeline() {
  const container = document.getElementById('timelineContainer');
  if (!container) return;

  const t = translations[currentLang].experience;
  container.innerHTML = t.timeline.map((item, index) => `
    <div class="tl-item ${index % 2 === 0 ? 'left' : 'right'}">
      <div class="tl-dot"></div>
      <div class="tl-card card">
        <span class="tl-period"><bdi>${item.period}</bdi></span>
        <h4 class="tl-role">${item.role}</h4>
        <div class="tl-company"><i class="ph-bold ph-buildings"></i> ${item.company}</div>
        <div class="tl-project"><i class="ph-bold ph-map-pin"></i> ${item.project}</div>
        <p class="tl-desc">${item.desc}</p>
      </div>
    </div>
  `).join('');
}

/* -----------------------------------------------------------
   7.5. Industry Training & Internships
----------------------------------------------------------- */
function renderTraining() {
  const container = document.getElementById('trainingGrid');
  if (!container) return;

  const t = translations[currentLang].training;
  if (!t || !t.items) return;

  container.innerHTML = t.items.map(item => `
    <article class="train-card card">
      <div>
        <div class="train-top">
          <span class="train-badge">${item.badge}</span>
          <span class="train-period"><bdi>${item.period}</bdi></span>
        </div>
        <h3 class="train-company">${item.company}</h3>
        <div class="train-div">${item.division}</div>
        <p class="train-desc">${item.desc}</p>
      </div>
    </article>
  `).join('');
}

/* -----------------------------------------------------------
   8. Skills (Exact matching with style.css)
----------------------------------------------------------- */
function renderSkills() {
  const container = document.getElementById('skillsGrid');
  if (!container) return;

  const t = translations[currentLang].skills;
  const icons = ['ph-fan', 'ph-lightning', 'ph-desktop', 'ph-clipboard-text'];

  container.innerHTML = t.categories.map((cat, idx) => `
    <div class="skill-group card">
      <div class="skill-group-header">
        <div class="sg-icon">
          <i class="ph-bold ${icons[idx] || 'ph-gear'}"></i>
        </div>
        <h3 class="sg-title">${cat.title}</h3>
      </div>
      <div class="skill-pills">
        ${cat.items.map(item => `
          <div class="skill-pill">
            <i class="ph-bold ph-check"></i>
            <span>${item}</span>
          </div>
        `).join('')}
      </div>
    </div>
  `).join('');
}

/* -----------------------------------------------------------
   9. Interactive Engineering Simulator Widget
----------------------------------------------------------- */
function initInteractiveWidget() {
  const tabs = document.querySelectorAll('.sim-tab');
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      const targetScheme = tab.getAttribute('data-scheme');
      showArchitectureScheme(targetScheme);
      playUiSound('click');
    });
  });

  showArchitectureScheme('pumps');
}

function showArchitectureScheme(scheme) {
  const display = document.getElementById('archViewerDisplay');
  if (!display) return;

  const isAr = currentLang === 'ar';

  if (scheme === 'pumps') {
    display.innerHTML = `
      <div class="flow-row">
        <div class="flow-node">
          <div class="fnode-icon"><i class="ph-bold ph-drop"></i></div>
          <div class="fnode-title">${isAr ? 'حوض التجميع والسحب' : 'Suction Sump & Intake'}</div>
          <div class="fnode-desc">${isAr ? 'مصافي خشنة ومحابس بوابة هيدروليكية' : 'Trash racks & isolation gate valves'}</div>
        </div>
        <div class="flow-arrow"><i class="ph-bold ph-arrow-right"></i></div>
        <div class="flow-node main">
          <div class="fnode-icon"><i class="ph-bold ph-fan"></i></div>
          <div class="fnode-title">${isAr ? '11 مضخة توريشيما يابانية' : '11× Torishima Heavy Pumps'}</div>
          <div class="fnode-desc">${isAr ? 'محاذاة ليزرية دقيقة وقواعد خرسانية عازلة' : 'Laser alignment & anti-vibration inertia bases'}</div>
        </div>
        <div class="flow-arrow"><i class="ph-bold ph-arrow-right"></i></div>
        <div class="flow-node">
          <div class="fnode-icon"><i class="ph-bold ph-gauge"></i></div>
          <div class="fnode-title">${isAr ? 'صمامات عدم الرجوع والمانومتر' : 'Non-Return Valves & Manifold'}</div>
          <div class="fnode-desc">${isAr ? 'حماية الخطوط من المطرقة المائية' : 'Dual-disc check valves & surge dampening'}</div>
        </div>
        <div class="flow-arrow"><i class="ph-bold ph-arrow-right"></i></div>
        <div class="flow-node">
          <div class="fnode-icon"><i class="ph-bold ph-arrows-out-line-horizontal"></i></div>
          <div class="fnode-title">${isAr ? 'خط الطرد الرئيسي والتوزيع' : 'Main Delivery Header'}</div>
          <div class="fnode-desc">${isAr ? 'أقطار كبرى متجهة لشبكة ترع الضبعة' : 'High-diameter transmission to canals'}</div>
        </div>
      </div>
      <div class="flow-tags">
        <span class="flow-tag"><i class="ph-bold ph-check"></i>${isAr ? '14 مضخة توريشيما تم الإشراف عليها' : '14 Torishima Pumps Supervised'}</span>
        <span class="flow-tag"><i class="ph-bold ph-shield"></i>${isAr ? 'اختبارات هيدروستاتيكية وفحص اهتزاز معتمد' : 'Hydrostatic & Vibration Testing Verified'}</span>
      </div>
    `;
  } else if (scheme === 'electrical') {
    display.innerHTML = `
      <div class="flow-row">
        <div class="flow-node">
          <div class="fnode-icon"><i class="ph-bold ph-lightning"></i></div>
          <div class="fnode-title">${isAr ? 'تغذية الجهد المتوسط 22/11 kV' : 'Medium Voltage Grid Infeed'}</div>
          <div class="fnode-desc">${isAr ? 'كابلات أرضية مسلحة وخلايا دخول MV' : 'Armored underground MV cables & incoming bays'}</div>
        </div>
        <div class="flow-arrow"><i class="ph-bold ph-arrow-right"></i></div>
        <div class="flow-node main">
          <div class="fnode-icon"><i class="ph-bold ph-hard-drive"></i></div>
          <div class="fnode-title">${isAr ? 'موزعات Switchgear والمحولات' : 'MV Switchgear & Transformers'}</div>
          <div class="fnode-desc">${isAr ? 'محولات خافضة للجهد وقواطع فراغية' : 'Vacuum circuit breakers & step-down transformers'}</div>
        </div>
        <div class="flow-arrow"><i class="ph-bold ph-arrow-right"></i></div>
        <div class="flow-node">
          <div class="fnode-icon"><i class="ph-bold ph-cpu"></i></div>
          <div class="fnode-title">${isAr ? 'لوحات التحكم VSD & Soft Starter' : 'VSD & Soft Starter Drives'}</div>
          <div class="fnode-desc">${isAr ? 'بدء دوران سلس وحماية المحركات' : 'Smooth acceleration profile & harmonic filtering'}</div>
        </div>
        <div class="flow-arrow"><i class="ph-bold ph-arrow-right"></i></div>
        <div class="flow-node">
          <div class="fnode-icon"><i class="ph-bold ph-engine"></i></div>
          <div class="fnode-title">${isAr ? 'محركات المضخات الحثية الكبرى' : 'Heavy Induction Motors'}</div>
          <div class="fnode-desc">${isAr ? 'عزم دوران عالي ومراقبة حرارية RTD' : 'High-torque drivers with thermal monitoring'}</div>
        </div>
      </div>
      <div class="flow-tags">
        <span class="flow-tag"><i class="ph-bold ph-check"></i>${isAr ? 'اختبارات عزل الميجر والجهد العالي' : 'Megger & Hi-Pot Insulation Tests Audited'}</span>
        <span class="flow-tag"><i class="ph-bold ph-shield"></i>${isAr ? 'شبكة تأريض صناعي معتمدة' : 'Industrial Grounding System Verified'}</span>
      </div>
    `;
  } else if (scheme === 'qa') {
    display.innerHTML = `
      <div class="flow-row">
        <div class="flow-node">
          <div class="fnode-icon"><i class="ph-bold ph-package"></i></div>
          <div class="fnode-title">${isAr ? 'توريد المعدات وفحص MIR' : 'Material Delivery & MIR'}</div>
          <div class="fnode-desc">${isAr ? 'فحص شهادات المنشأ والاختبارات المصنعية' : 'Origin certificate & factory test report review'}</div>
        </div>
        <div class="flow-arrow"><i class="ph-bold ph-arrow-right"></i></div>
        <div class="flow-node main">
          <div class="fnode-icon"><i class="ph-bold ph-ruler"></i></div>
          <div class="fnode-title">${isAr ? 'التركيب والمطابقة الميدانية' : 'Installation & Shop Drawing Audit'}</div>
          <div class="fnode-desc">${isAr ? 'تنفيذ دقيق وفق المخططات المعتمدة' : 'Strict alignment to approved MEP shop drawings'}</div>
        </div>
        <div class="flow-arrow"><i class="ph-bold ph-arrow-right"></i></div>
        <div class="flow-node">
          <div class="fnode-icon"><i class="ph-bold ph-clipboard-text"></i></div>
          <div class="fnode-title">${isAr ? 'طلب الفحص والاستلام (IR)' : 'Inspection Request (IR)'}</div>
          <div class="fnode-desc">${isAr ? 'جولة ميدانية مشتركة مع الاستشاري' : 'Joint site inspection walk with supervising consultant'}</div>
        </div>
        <div class="flow-arrow"><i class="ph-bold ph-arrow-right"></i></div>
        <div class="flow-node">
          <div class="fnode-icon"><i class="ph-bold ph-seal-check"></i></div>
          <div class="fnode-title">${isAr ? 'التسليم النهائي والمستخلصات' : 'Final Sign-off & Invoicing'}</div>
          <div class="fnode-desc">${isAr ? 'اعتماد 100% ورسومات As-Built' : '100% approval rate & As-Built handover'}</div>
        </div>
      </div>
      <div class="flow-tags">
        <span class="flow-tag"><i class="ph-bold ph-check"></i>${isAr ? 'سجل خالٍ تماماً من الملاحظات الحرجة' : 'Zero Critical Snag Record'}</span>
        <span class="flow-tag"><i class="ph-bold ph-shield"></i>${isAr ? 'تنسيق مع كبرى المكاتب الاستشارية' : 'Coordinated with Leading Consultant Offices'}</span>
      </div>
    `;
  }
}

function updateInteractiveWidgetLang() {
  const activeTab = document.querySelector('.sim-tab.active');
  if (activeTab) {
    showArchitectureScheme(activeTab.getAttribute('data-scheme'));
  }
}

/* -----------------------------------------------------------
   10. Modals
----------------------------------------------------------- */
function initModals() {
  const modal = document.getElementById('projectModal');
  const closeBtn = document.getElementById('closeModalBtn');
  const backdrop = document.querySelector('.modal-bg');

  if (closeBtn) closeBtn.addEventListener('click', closeModal);
  if (backdrop) backdrop.addEventListener('click', closeModal);

  window.addEventListener('keydown', e => {
    if (e.key === 'Escape') closeModal();
  });

  document.querySelectorAll('.trigger-cv-download').forEach(btn => {
    btn.addEventListener('click', () => {
      showToast(
        currentLang === 'ar' ? 'جاري فتح السيرة الذاتية على Google Drive...' : 'Opening CV on Google Drive...',
        'success'
      );
    });
  });
}

function openProjectModal(projectId) {
  const modal = document.getElementById('projectModal');
  const modalBody = document.getElementById('modalContent');
  if (!modal || !modalBody) return;

  const t = translations[currentLang].projects;
  const project = t.items.find(p => p.id === projectId);
  if (!project) return;

  const mTrans = translations[currentLang].modal;
  const isAr = currentLang === 'ar';

  modalBody.innerHTML = `
    <div class="modal-banner">
      <span class="gold-badge">${project.badge}</span>
      <h2>${project.title}</h2>
      <div class="modal-banner-sub">${project.project}</div>
    </div>

    <div class="modal-meta">
      <div><span class="m-label">${mTrans.contractor}</span><span class="m-val"><strong>${project.company}</strong></span></div>
      <div><span class="m-label">${mTrans.duration}</span><span class="m-val">${project.period}</span></div>
      <div><span class="m-label">${mTrans.location}</span><span class="m-val">${project.location}</span></div>
      <div><span class="m-label">${mTrans.scope}</span><span class="m-val">${project.scope}</span></div>
    </div>

    <div class="modal-section">
      <h3><i class="ph-bold ph-gear-six"></i> ${isAr ? 'المواصفات الفنية المعتمدة' : 'Technical Specifications & Systems'}</h3>
      <div class="modal-spec-rows">
        ${Object.entries(project.specs).map(([k, v]) => `
          <div class="modal-spec-row">
            <span class="modal-spec-key">${formatSpecLabel(k)}</span>
            <span class="modal-spec-val">${v}</span>
          </div>
        `).join('')}
      </div>
    </div>

    <div class="modal-section">
      <h3><i class="ph-bold ph-list-checks"></i> ${mTrans.keyAccomplishments}</h3>
      <ul class="modal-hl-list">
        ${project.highlights.map(h => `
          <li><i class="ph-bold ph-check-circle"></i><span>${h}</span></li>
        `).join('')}
      </ul>
    </div>

    <div class="modal-actions">
      <a href="https://wa.me/201064888996?text=${encodeURIComponent((isAr ? 'مرحباً م. محمد، أود مناقشة تفاصيل مشروع: ' : 'Hello Eng. Mohamed, inquiring regarding project: ') + project.title)}" target="_blank" class="btn btn-primary btn-sm">
        <i class="ph-bold ph-whatsapp-logo"></i> ${isAr ? 'تواصل عبر واتساب' : 'Discuss on WhatsApp'}
      </a>
      <a href="https://drive.google.com/drive/folders/17Pxsjy0zPxzAwhKV6-YxneQ1S4Zo2znD" target="_blank" rel="noopener noreferrer" class="btn btn-outline btn-sm trigger-cv-download">
        <i class="ph-bold ph-arrow-square-out"></i> ${mTrans.downloadPdf}
      </a>
    </div>
  `;

  modal.classList.add('active');
  document.body.style.overflow = 'hidden';
}

function closeModal() {
  const modal = document.getElementById('projectModal');
  if (modal) modal.classList.remove('active');
  document.body.style.overflow = '';
}

function showToast(message, type = 'info') {
  let toastWrap = document.querySelector('.toast-wrap');
  if (!toastWrap) {
    toastWrap = document.createElement('div');
    toastWrap.className = 'toast-wrap';
    document.body.appendChild(toastWrap);
  }

  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.innerHTML = `<i class="ph-bold ph-check-circle"></i><span>${message}</span>`;
  toastWrap.appendChild(toast);

  setTimeout(() => toast.classList.add('show'), 30);
  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => toast.remove(), 300);
  }, 4000);
}
