(() => {
  document.documentElement.classList.add('js');

  const story = document.querySelector('#story');
  const progressBar = document.querySelector('.reading-progress');
  const progressIndicator = document.querySelector('#reading-progress');
  const revealItems = document.querySelectorAll('.reveal');
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const updateProgress = () => {
    if (!story || !progressBar || !progressIndicator) return;

    const storyTop = window.scrollY + story.getBoundingClientRect().top;
    const scrollRange = story.offsetHeight - window.innerHeight;
    const progress = scrollRange <= 0
      ? (window.scrollY >= storyTop ? 100 : 0)
      : Math.min(100, Math.max(0, ((window.scrollY - storyTop) / scrollRange) * 100));

    progressIndicator.style.transform = `scaleX(${progress / 100})`;
    progressBar.setAttribute('aria-valuenow', String(Math.round(progress)));
  };

  const revealAll = () => {
    revealItems.forEach((item) => item.classList.add('is-visible'));
  };

  const initialize = () => {
    updateProgress();

    if (reducedMotion || !('IntersectionObserver' in window)) {
      revealAll();
      return;
    }

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;

        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      });
    });

    revealItems.forEach((item) => observer.observe(item));
  };

  let animationFrame = null;
  const scheduleProgressUpdate = () => {
    if (animationFrame !== null) return;

    animationFrame = window.requestAnimationFrame(() => {
      animationFrame = null;
      updateProgress();
    });
  };

  window.addEventListener('scroll', scheduleProgressUpdate, { passive: true });
  window.addEventListener('resize', scheduleProgressUpdate);
  document.addEventListener('DOMContentLoaded', initialize, { once: true });
})();
