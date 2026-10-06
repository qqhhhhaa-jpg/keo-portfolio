/* ===== KEO / كيو — Main JS ===== */

document.addEventListener('DOMContentLoaded', () => {

  // ===== Navbar scroll =====
  const navbar = document.getElementById('navbar');
  window.addEventListener('scroll', () => {
    navbar.classList.toggle('scrolled', window.scrollY > 50);
  });

  // ===== Mobile menu =====
  const hamburger = document.getElementById('hamburger');
  const navLinks = document.getElementById('navLinks');

  hamburger.addEventListener('click', () => {
    hamburger.classList.toggle('open');
    navLinks.classList.toggle('open');
  });

  // Close menu when clicking a link
  navLinks.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      hamburger.classList.remove('open');
      navLinks.classList.remove('open');
    });
  });

  // ===== Active nav link on scroll =====
  const sections = document.querySelectorAll('section[id]');
  const navAnchors = document.querySelectorAll('.nav-links a');

  window.addEventListener('scroll', () => {
    let current = '';
    sections.forEach(section => {
      const top = section.offsetTop - 120;
      if (window.scrollY >= top) current = section.getAttribute('id');
    });
    navAnchors.forEach(a => {
      a.classList.toggle('active', a.getAttribute('href') === '#' + current);
    });
  });

  // ===== Reveal on scroll =====
  const revealEls = document.querySelectorAll('.reveal');
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15 });

  revealEls.forEach(el => revealObserver.observe(el));

  // ===== Animated counters =====
  const counters = document.querySelectorAll('.stat-num');
  const counterObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const el = entry.target;
        const target = parseInt(el.dataset.target);
        let current = 0;
        const step = Math.ceil(target / 60);
        const timer = setInterval(() => {
          current += step;
          if (current >= target) {
            current = target;
            clearInterval(timer);
          }
          el.textContent = current;
        }, 25);
        counterObserver.unobserve(el);
      }
    });
  }, { threshold: 0.5 });

  counters.forEach(c => counterObserver.observe(c));

  // ===== Work filtering =====
  const filterBtns = document.querySelectorAll('.filter-btn');
  const workCards = document.querySelectorAll('.work-card');

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const filter = btn.dataset.filter;

      workCards.forEach(card => {
        const cat = card.dataset.category;
        if (filter === 'all' || cat === filter) {
          card.classList.remove('hide');
          card.style.animation = 'none';
          card.offsetHeight; // reflow
          card.style.animation = '';
        } else {
          card.classList.add('hide');
        }
      });
    });
  });

  // ===== Custom Lightbox =====
  const customLightbox = document.getElementById('customLightbox');
  const lightboxContent = document.getElementById('lightboxContent');
  const lightboxTitle = document.getElementById('lightboxTitle');
  const lightboxCategory = document.getElementById('lightboxCategory');
  const lightboxClose = document.getElementById('lightboxClose');
  const lightboxPrev = document.getElementById('lightboxPrev');
  const lightboxNext = document.getElementById('lightboxNext');
  const zoomIn = document.getElementById('zoomIn');
  const zoomOut = document.getElementById('zoomOut');
  const zoomReset = document.getElementById('zoomReset');
  
  let currentWorkIndex = 0;
  let currentWorks = [];
  let currentScale = 1;

  // Check if elements exist before adding event listeners
  if (customLightbox && lightboxClose) {
    lightboxClose.addEventListener('click', closeCustomLightbox);
  }
  
  if (lightboxPrev) {
    lightboxPrev.addEventListener('click', showPreviousWork);
  }
  
  if (lightboxNext) {
    lightboxNext.addEventListener('click', showNextWork);
  }
  
  if (zoomIn) {
    zoomIn.addEventListener('click', zoomInFunc);
  }
  
  if (zoomOut) {
    zoomOut.addEventListener('click', zoomOutFunc);
  }
  
  if (zoomReset) {
    zoomReset.addEventListener('click', zoomResetFunc);
  }

  // Open custom lightbox
  function openCustomLightbox(work, allWorks) {
    currentWorkIndex = allWorks.indexOf(work);
    currentWorks = allWorks;
    currentScale = 1;
    
    if (lightboxTitle) lightboxTitle.textContent = work.title;
    if (lightboxCategory) lightboxCategory.textContent = work.category;
    
    // Clear previous content
    if (lightboxContent) lightboxContent.innerHTML = '';
    
    // Add image or video
    if (lightboxContent && work.media && work.media[0]?.type === 'video') {
      const video = document.createElement('video');
      video.src = work.media[0].url;
      video.controls = true;
      video.style.maxWidth = '100%';
      video.style.maxHeight = '90vh';
      lightboxContent.appendChild(video);
    } else if (lightboxContent) {
      const img = document.createElement('img');
      img.src = work.image || work.images?.[0] || work.media?.[0]?.url;
      img.alt = work.title;
      img.style.maxWidth = '100%';
      img.style.maxHeight = '90vh';
      lightboxContent.appendChild(img);
    }
    
    if (customLightbox) {
      customLightbox.classList.add('open');
      document.body.style.overflow = 'hidden';
    }
    updateNavigationButtons();
  }

  // Close custom lightbox
  function closeCustomLightbox() {
    if (customLightbox) {
      customLightbox.classList.remove('open');
      document.body.style.overflow = '';
    }
    currentScale = 1;
  }

  // Navigation
  function showPreviousWork() {
    if (currentWorkIndex > 0) {
      currentWorkIndex--;
      updateLightboxContent();
      updateNavigationButtons();
    }
  }

  function showNextWork() {
    if (currentWorkIndex < currentWorks.length - 1) {
      currentWorkIndex++;
      updateLightboxContent();
      updateNavigationButtons();
    }
  }

  function updateLightboxContent() {
    const work = currentWorks[currentWorkIndex];
    
    if (lightboxTitle) lightboxTitle.textContent = work.title;
    if (lightboxCategory) lightboxCategory.textContent = work.category;
    
    if (lightboxContent) {
      lightboxContent.innerHTML = '';
      
      if (work.media && work.media[0]?.type === 'video') {
        const video = document.createElement('video');
        video.src = work.media[0].url;
        video.controls = true;
        video.style.maxWidth = '100%';
        video.style.maxHeight = '90vh';
        lightboxContent.appendChild(video);
      } else {
        const img = document.createElement('img');
        img.src = work.image || work.images?.[0] || work.media?.[0]?.url;
        img.alt = work.title;
        img.style.maxWidth = '100%';
        img.style.maxHeight = '90vh';
        lightboxContent.appendChild(img);
      }
    }
  }

  function updateNavigationButtons() {
    if (lightboxPrev) lightboxPrev.style.display = currentWorkIndex > 0 ? 'flex' : 'none';
    if (lightboxNext) lightboxNext.style.display = currentWorkIndex < currentWorks.length - 1 ? 'flex' : 'none';
  }

  // Zoom controls
  function zoomInFunc() {
    currentScale = Math.min(currentScale * 1.2, 3);
    applyZoom();
  }

  function zoomOutFunc() {
    currentScale = Math.max(currentScale / 1.2, 0.5);
    applyZoom();
  }

  function zoomResetFunc() {
    currentScale = 1;
    applyZoom();
  }

  function applyZoom() {
    const content = lightboxContent?.querySelector('img, video');
    if (content) {
      content.style.transform = `scale(${currentScale})`;
    }
  }

  // Keyboard navigation
  document.addEventListener('keydown', (e) => {
    if (!customLightbox || !customLightbox.classList.contains('open')) return;
    
    switch(e.key) {
      case 'Escape':
        closeCustomLightbox();
        break;
      case 'ArrowLeft':
        showPreviousWork();
        break;
      case 'ArrowRight':
        showNextWork();
        break;
      case '+':
      case '=':
        zoomInFunc();
        break;
      case '-':
        zoomOutFunc();
        break;
      case '0':
        zoomResetFunc();
        break;
    }
  });

  // Click outside to close
  if (customLightbox) {
    customLightbox.addEventListener('click', (e) => {
      if (e.target === customLightbox) {
        closeCustomLightbox();
      }
    });
  }

  // Setup work interactions with custom lightbox
  function setupWorkInteractions() {
    const workCards = document.querySelectorAll('.work-card');
    const filterBtns = document.querySelectorAll('.filter-btn');
    const allWorks = JSON.parse(localStorage.getItem('keo_works') || '[]');
    
    // Filter buttons
    filterBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        filterBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const filter = btn.dataset.filter;
        
        workCards.forEach(card => {
          const cat = card.dataset.category;
          if (filter === 'all' || cat === filter) {
            card.classList.remove('hide');
            card.style.animation = 'none';
            card.offsetHeight;
            card.style.animation = '';
          } else {
            card.classList.add('hide');
          }
        });
      });
    });

    // Work cards click
    workCards.forEach(card => {
      card.addEventListener('click', () => {
        const title = card.querySelector('h3').textContent;
        const cat = card.querySelector('.work-cat').textContent;
        const img = card.querySelector('.work-img img');
        
        // Find the work data
        const work = allWorks.find(w => w.title === title && w.category === cat);
        if (work) {
          openCustomLightbox(work, allWorks);
        }
      });
    });
  }

  // ===== Contact form (demo) =====
  const contactForm = document.getElementById('contactForm');
  contactForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const btn = contactForm.querySelector('button');
    const original = btn.innerHTML;
    btn.innerHTML = '<i class="fas fa-check"></i> تم الإرسال!';
    btn.style.background = '#16a34a';
    setTimeout(() => {
      btn.innerHTML = original;
      btn.style.background = '';
      contactForm.reset();
    }, 2500);
  });

  // ===== Footer year =====
  document.getElementById('year').textContent = new Date().getFullYear();

  // ===== View counter =====
  async function loadViews() {
    const el = document.getElementById('viewCount');
    try {
      const res = await fetch('/api/views');
      const data = await res.json();
      if (el) el.textContent = data.views ? data.views.toLocaleString('en') : '0';
    } catch (e) {
      // الخادم غير متاح — تجاهل
      if (el) el.textContent = '0';
    }
  }
  loadViews();

  // ===== Carousel =====
  const carouselTrack = document.getElementById('carouselTrack');
  const carouselPrev = document.getElementById('carouselPrev');
  const carouselNext = document.getElementById('carouselNext');
  const carouselDots = document.getElementById('carouselDots');
  let carouselIndex = 0;
  let carouselSlides = [];
  let autoTimer = null;

  async function loadCarousel() {
    try {
      const res = await fetch('/api/works');
      const data = await res.json();
      const works = data.works || [];
      if (works.length === 0) {
        // لا توجد أعمال — اعرض رسالة
        carouselTrack.innerHTML = `
          <div class="carousel-slide">
            <div class="placeholder" style="height:100%;">
              <i class="fas fa-images"></i>
              <span>لا توجد أعمال بعد — أضفها من لوحة التحكم</span>
            </div>
          </div>`;
        return;
      }
      carouselSlides = works;
      carouselTrack.innerHTML = works.map(w => `
        <div class="carousel-slide">
          <img src="${w.image}" alt="${w.title}" loading="lazy">
          <div class="slide-caption">${w.title}<span>${w.category}</span></div>
        </div>
      `).join('');
      // بناء النقاط
      carouselDots.innerHTML = works.map((_, i) =>
        `<button class="carousel-dot${i === 0 ? ' active' : ''}" data-index="${i}"></button>`
      ).join('');
      carouselDots.querySelectorAll('.carousel-dot').forEach(dot => {
        dot.addEventListener('click', () => goToSlide(parseInt(dot.dataset.index)));
      });
      startAutoSlide();
    } catch (e) {
      carouselTrack.innerHTML = `
        <div class="carousel-slide">
          <div class="placeholder" style="height:100%;">
            <i class="fas fa-images"></i>
            <span>لا توجد أعمال بعد</span>
          </div>
        </div>`;
    }
  }

  function goToSlide(index) {
    if (carouselSlides.length === 0) return;
    carouselIndex = (index + carouselSlides.length) % carouselSlides.length;
    carouselTrack.style.transform = `translateX(${carouselIndex * 100}%)`;
    carouselDots.querySelectorAll('.carousel-dot').forEach((d, i) => {
      d.classList.toggle('active', i === carouselIndex);
    });
  }

  function startAutoSlide() {
    if (autoTimer) clearInterval(autoTimer);
    if (carouselSlides.length <= 1) return;
    autoTimer = setInterval(() => {
      goToSlide(carouselIndex + 1);
    }, 3500);
  }

  if (carouselPrev) carouselPrev.addEventListener('click', () => { goToSlide(carouselIndex - 1); startAutoSlide(); });
  if (carouselNext) carouselNext.addEventListener('click', () => { goToSlide(carouselIndex + 1); startAutoSlide(); });

  // إيقاف التشغيل التلقائي عند التمرير فوق الكاروسيل
  const carouselWrap = document.querySelector('.carousel-wrap');
  if (carouselWrap) {
    carouselWrap.addEventListener('mouseenter', () => { if (autoTimer) clearInterval(autoTimer); });
    carouselWrap.addEventListener('mouseleave', startAutoSlide);
  }

  loadCarousel();

  // ===== Programs =====
  const programsGrid = document.getElementById('programsGrid');

  async function loadPrograms() {
    try {
      const res = await fetch('/api/programs');
      const data = await res.json();
      const programs = data.programs || [];
      if (programs.length === 0) {
        programsGrid.innerHTML = `
          <div class="empty-state" style="grid-column:1/-1;text-align:center;color:var(--gray-600);padding:40px;">
            <i class="fas fa-rocket" style="font-size:40px;opacity:.4;display:block;margin-bottom:10px;"></i>
            لا توجد برامج بعد — أضفها من لوحة التحكم
          </div>`;
        return;
      }
      programsGrid.innerHTML = programs.map(p => `
        <div class="program-card" onclick="openProgram('${p.id}')">
          <div class="program-icon"><i class="fab fa-${platformIcon(p.platform)}"></i></div>
          <h3>${p.name}</h3>
          <p>${p.platform === 'telegram' ? 'تيليجرام' : p.platform === 'whatsapp' ? 'واتساب' : p.platform === 'instagram' ? 'انستغرام' : 'موقع'}</p>
          <span class="program-go">اذهب للمنصة <i class="fas fa-arrow-left"></i></span>
        </div>
      `).join('');
    } catch (e) {
      programsGrid.innerHTML = `
        <div class="empty-state" style="grid-column:1/-1;text-align:center;color:var(--gray-600);padding:40px;">
          <i class="fas fa-rocket" style="font-size:40px;opacity:.4;display:block;margin-bottom:10px;"></i>
          لا توجد برامج بعد
        </div>`;
    }
  }

  function platformIcon(platform) {
    switch (platform) {
      case 'telegram': return 'telegram';
      case 'whatsapp': return 'whatsapp';
      case 'instagram': return 'instagram';
      default: return 'globe';
    }
  }

  // فتح البرنامج مع رسالة ترحيبية
  window.openProgram = async function(id) {
    try {
      const res = await fetch('/api/programs');
      const data = await res.json();
      const program = (data.programs || []).find(p => p.id === id);
      if (!program) return;

      // بناء رابط المنصة مع رسالة الترحيب
      let url = program.link;
      const welcome = encodeURIComponent(program.welcome || 'أهلاً بك في KEO / كيو!');

      if (program.platform === 'telegram') {
        // إذا كان الرابط لتيليجرام، أضف نص الرسالة
        if (url.includes('t.me/')) {
          url = url.replace(/\/?$/, '') + '?text=' + welcome;
        }
      } else if (program.platform === 'whatsapp') {
        // واتساب: wa.me مع نص
        if (url.includes('wa.me/') || url.includes('whatsapp.com')) {
          url = url.replace(/\/?$/, '') + '?text=' + welcome;
        }
      }

      window.open(url, '_blank');
    } catch (e) {
      // تجاهل
    }
  };

  loadPrograms();

  // ===== Load Works for "أحدث تصاميمي" section =====
  const workGrid = document.getElementById('workGrid');

  async function loadWorks() {
    try {
      const res = await fetch('/api/works');
      const data = await res.json();
      const works = data.works || [];
      if (works.length === 0) {
        workGrid.innerHTML = `
          <div class="empty-state" style="grid-column:1/-1;text-align:center;color:var(--gray-600);padding:40px;">
            <i class="fas fa-images" style="font-size:40px;opacity:.4;display:block;margin-bottom:10px;"></i>
            لا توجد أعمال بعد — أضفها من لوحة التحكم
          </div>`;
        return;
      }
      workGrid.innerHTML = works.map(w => `
        <div class="work-card" data-category="${w.category}">
          <div class="work-img ${w.media && w.media[0]?.type === 'video' ? 'video' : ''}">
            ${w.media && w.media[0]?.type === 'video' ? 
              `<img src="${w.media[0].url}" alt="${w.title}" loading="lazy">
               <div class="play-icon"><i class="fas fa-play"></i></div>
               <div class="type-badge">فيديو</div>` :
              `<img src="${w.image || w.images?.[0] || w.media?.[0]?.url}" alt="${w.title}" loading="lazy">`
            }
          </div>
          <div class="work-info">
            <h3>${w.title}</h3>
            <span class="work-cat">${w.category}</span>
          </div>
        </div>
      `).join('');

      // إعادة ربط الفلترة واللايت بوكس للأعمال الجديدة
      setupWorkInteractions();
    } catch (e) {
      workGrid.innerHTML = `
        <div class="empty-state" style="grid-column:1/-1;text-align:center;color:var(--gray-600);padding:40px;">
          <i class="fas fa-images" style="font-size:40px;opacity:.4;display:block;margin-bottom:10px;"></i>
          لا توجد أعمال بعد
        </div>`;
    }
  }

  loadWorks();

});
