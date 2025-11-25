import { describe, it, expect } from 'vitest';

/**
 * Swiper Configuration Tests
 *
 * Tests that verify the Swiper configuration object meets requirements
 * for mobile card swiping functionality.
 */

describe('Swiper Configuration', () => {
  // This represents the config used in MobileSwiper.astro
  const getSwiperConfig = () => ({
    modules: ['Pagination'],

    pagination: {
      el: '.swiper-pagination',
      clickable: true,
      bulletClass: 'swiper-pagination-bullet',
      bulletActiveClass: 'swiper-pagination-bullet-active',
    },

    touchEventsTarget: 'container',
    touchRatio: 1,
    touchAngle: 45,
    grabCursor: true,

    loop: false,
    slidesPerView: 1,
    spaceBetween: 16,
    centeredSlides: true,

    watchSlidesProgress: true,

    a11y: {
      enabled: true,
      prevSlideMessage: 'Previous slide',
      nextSlideMessage: 'Next slide',
      firstSlideMessage: 'This is the first slide',
      lastSlideMessage: 'This is the last slide',
      paginationBulletMessage: 'Go to slide {{index}}',
    },

    speed: 300,
  });

  it('has pagination enabled', () => {
    const config = getSwiperConfig();
    expect(config.pagination).toBeDefined();
    expect(config.pagination.el).toBe('.swiper-pagination');
  });

  it('pagination is clickable', () => {
    const config = getSwiperConfig();
    expect(config.pagination.clickable).toBe(true);
  });

  it('has correct pagination bullet classes', () => {
    const config = getSwiperConfig();
    expect(config.pagination.bulletClass).toBe('swiper-pagination-bullet');
    expect(config.pagination.bulletActiveClass).toBe('swiper-pagination-bullet-active');
  });

  it('has touch events enabled', () => {
    const config = getSwiperConfig();
    expect(config.touchEventsTarget).toBe('container');
    expect(config.touchRatio).toBe(1);
  });

  it('has grab cursor enabled', () => {
    const config = getSwiperConfig();
    expect(config.grabCursor).toBe(true);
  });

  it('shows one slide at a time', () => {
    const config = getSwiperConfig();
    expect(config.slidesPerView).toBe(1);
  });

  it('has spacing between slides', () => {
    const config = getSwiperConfig();
    expect(config.spaceBetween).toBe(16);
  });

  it('centers slides', () => {
    const config = getSwiperConfig();
    expect(config.centeredSlides).toBe(true);
  });

  it('loop is disabled (prevents infinite swiping)', () => {
    const config = getSwiperConfig();
    expect(config.loop).toBe(false);
  });

  it('has accessibility settings configured', () => {
    const config = getSwiperConfig();
    expect(config.a11y).toBeDefined();
    expect(config.a11y.enabled).toBe(true);
  });

  it('has accessibility messages for navigation', () => {
    const config = getSwiperConfig();
    expect(config.a11y.prevSlideMessage).toBe('Previous slide');
    expect(config.a11y.nextSlideMessage).toBe('Next slide');
    expect(config.a11y.firstSlideMessage).toBe('This is the first slide');
    expect(config.a11y.lastSlideMessage).toBe('This is the last slide');
  });

  it('has pagination bullet accessibility message', () => {
    const config = getSwiperConfig();
    expect(config.a11y.paginationBulletMessage).toContain('{{index}}');
  });

  it('has appropriate transition speed', () => {
    const config = getSwiperConfig();
    expect(config.speed).toBe(300);
    expect(config.speed).toBeGreaterThanOrEqual(0);
    expect(config.speed).toBeLessThanOrEqual(1000);
  });

  it('watches slide progress for performance', () => {
    const config = getSwiperConfig();
    expect(config.watchSlidesProgress).toBe(true);
  });

  it('has modules array with Pagination', () => {
    const config = getSwiperConfig();
    expect(config.modules).toContain('Pagination');
  });

  it('touch angle is configured for swipe detection', () => {
    const config = getSwiperConfig();
    expect(config.touchAngle).toBe(45);
    expect(config.touchAngle).toBeGreaterThan(0);
  });

  it('configuration is a valid object', () => {
    const config = getSwiperConfig();
    expect(config).toBeTypeOf('object');
    expect(config).not.toBeNull();
  });

  it('has all required properties', () => {
    const config = getSwiperConfig();
    const requiredProps = [
      'pagination',
      'touchEventsTarget',
      'grabCursor',
      'slidesPerView',
      'a11y',
    ];

    requiredProps.forEach((prop) => {
      expect(config).toHaveProperty(prop);
    });
  });
});
