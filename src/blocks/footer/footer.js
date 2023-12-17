function mobileFooterNav () {
  const footer = document.querySelector("footer.footer");

  if (!footer) return;

  const footerNavs = footer.querySelectorAll(".footer-nav");

  footerNavs.forEach(footerNav => {
    const footerTitle = footerNav.querySelector(".footer__title");

    footerTitle.addEventListener("click", () => {
      footerTitle.classList.toggle("js-mobile-nav-open");
    });
  })
}

mobileFooterNav()