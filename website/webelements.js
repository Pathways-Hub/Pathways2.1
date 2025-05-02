window.addEventListener('DOMContentLoaded', () => {
    const gifs = [
      "https://art.ngfiles.com/images/3064000/3064395_vulpsvulps_warm-evening.gif?f1677194398",
      "https://i.pinimg.com/originals/80/6e/de/806ede5583f088c6bdb788bf867f8064.gif",
      "https://64.media.tumblr.com/dba8930c075bf505728df757c37b4216/tumblr_oh8awjk7lA1qze3hdo1_r1_500.gif",
      "https://forums.pokemmo.com/uploads/monthly_2022_02/eb1adbec173091c225ad27e8ca55f0ac.gif.fcef02cb394548e6443b543ee929f44d.gif",
      "https://i.pinimg.com/originals/c0/d7/cb/c0d7cb6b7c65398d950beb6930ba2e35.gif",
      "https://i.pinimg.com/originals/21/e2/e7/21e2e73eb9a9984e3b407328f65f5e5b.gif",
      "https://i.pinimg.com/originals/6a/cd/07/6acd0780a4c693b2cf8da52b5c44b18e.gif",
      "https://i.pinimg.com/originals/bb/51/e4/bb51e408f9a7c83801683149773ca69c.gif",
      "https://i0.wp.com/halcyonrealms.com/blogpics/japgifB.gif?resize=500%2C291&ssl=1",
      "https://i.pinimg.com/originals/cf/2c/a4/cf2ca4f35eff08e2d8724e2e4b5cdf42.gif",
    ];
  
    const randomGif = gifs[Math.floor(Math.random() * gifs.length)];
    const container = document.querySelector('.extra-container');
    if (container) {
      container.style.backgroundImage = `url("${randomGif}")`;
    }
  });
  