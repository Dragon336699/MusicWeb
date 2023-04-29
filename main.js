// 1. Render songs
// 2. Scroll top
// 3. Play/pause/seekTime
// 4. CD rotate
// 5. Next / Prev
// 6. Random
// 7. Next / Repeat when ended
// 8. Active song
// 9. Scroll active song into view
// 10. Play song when click
// 11. Fix bugs

const $ = document.querySelector.bind(document)
const $$ = document.querySelectorAll.bind(document)
const PLAYER_STORAGE_KEY = 'F8_PLAYER'
const heading = $('header h2')
const cdThump = $('.cd-thumb')
const audio = $('#audio')
const cd = $('.cd')
const playBtn = $('.btn-toggle-play')
const player = $('.player')
const progress = $('#progress')
const prevBtn = $('.btn-prev')
const nextBtn = $('.btn-next')
const randomBtn = $('.btn-random')
const repeatBtn = $('.btn-repeat')
const playlist = $('.playlist')
const app = {
    currentIndex: 5,
    isPlaying: false,
    isRandom: false,
    isRepeat: false,
    config: JSON.parse(localStorage.getItem(PLAYER_STORAGE_KEY)) || {},
    songs: [
        {
            name: "Gửi mẹ",
            singer: "MCK",
            path: "./music/y2mate.com - Gửi mẹ  Nger Prod by Shark  Lyrics video  HD1080p  Video Fanmade.mp3",
            image: "./img/Gui me.png"
        },
        {
            name: "Không tên",
            singer: "MCK",
            path: "./music/y2mate.com - Không Tên  MCK aka Nger  Official Lyrics Video.mp3",
            image: "./img/Khong ten.png"
        },
        {
            name: "Chuyện chàng trông xe",
            singer: "MCK",
            path: "./music/y2mate.com - MCK Nger  Chuyện chàng trông xe  Audio.mp3",
            image: "./img/Chuyen chang trong xe.png"
        },
        {
            name: "Khi người mình yêu khóc",
            singer: "Phan Mạnh Quỳnh",
            path: "./music/Khi người mình yêu khóc.mp3",
            image: "./img/Khi người mình yêu khóc.jpg"
        },
        {
            name: "Như anh đã thấy em",
            singer: "FreakD",
            path: "./music/Như anh đã thấy em.mp3",
            image: "./img/Như anh đã thấy em.png"
        },
        {
            name: "Write this down",
            singer: "Snoop Dogg",
            path: "./music/Write this down.mp3",
            image: "./img/Write this down.png"
        }
    ],
    setConfig: function (key, value) {
        this.config[key] = value;
        localStorage.setItem(PLAYER_STORAGE_KEY, JSON.stringify(this.config))
    },
    defineProperties: function () {
        Object.defineProperty(this, 'currentSong', {
            get: function () {
                return this.songs[this.currentIndex];
            }
        })
    },
    render: function () {
        const htmls = this.songs.map((song, index) => {
            return `
            <div class="song ${index === this.currentIndex ? 'active' : ''}" data-index = "${index}">
                <div class="thumb"
                    style="background-image: url('${song.image}')">
                </div>
                <div class="body">
                    <h3 class="title">${song.name}</h3>
                    <p class="author">${song.singer}</p>
                </div>
                <div class="option">
                    <i class="fas fa-ellipsis-h"></i>
                </div>
            </div>
            `
        })
        $('.playlist').innerHTML = htmls.join('')
    },
    handleEvents: function () {
        const cdWidth = cd.offsetWidth;

        // Xử lý cd quay và dừng
        const cdThumpAnimate = cdThump.animate([
            { transform: 'rotate(360deg)' }
        ], {
            duration: 10000,
            iterations: Infinity
        })
        cdThumpAnimate.pause()
        // Xử lý phóng to thu nhỏ cd
        document.onscroll = function () {
            var scrollTop = window.scrollY;
            const newCdWidth = cdWidth - scrollTop
            cd.style.width = (newCdWidth > 0) ? newCdWidth + 'px' : 0
            cd.style.opacity = newCdWidth / cdWidth
        }
        // Xử lý khi click play
        playBtn.onclick = function () {
            if (app.isPlaying) {
                audio.pause()
            }
            else {
                audio.play()
            }
            audio.onplay = function () {
                player.classList.add('playing')
                cdThumpAnimate.play()
                app.isPlaying = true;
            }
            audio.onpause = function () {
                player.classList.remove('playing')
                cdThumpAnimate.pause()
                app.isPlaying = false;
            }
        }
        // Chạy thanh khi nhạc chạy
        progress.value = 0;
        audio.ontimeupdate = function () {
            if (audio.duration) {
                const progressPercent = audio.currentTime / audio.duration * 100
                progress.value = progressPercent;
            }
        }

        // Xử lý khi tua nhạc
        progress.oninput = function (e) {
            const seekTime = e.target.value / 100 * audio.duration
            audio.currentTime = seekTime
        }
        // Khi next song
        nextBtn.onclick = function () {
            if (app.isRandom) {
                app.randomSong();
            }
            else {
                app.nextSong();
            }
            audio.play();
            app.render();
            app.scrollToActiveSong();
        }
        prevBtn.onclick = function () {
            if (audio.currentTime > 5) {
                audio.currentTime = 0
            }
            else {
                if (app.isRandom) {
                    app.randomSong();
                }
                else {
                    app.preSong();
                }
                audio.play()
                app.render();
                app.scrollToActiveSong();
            }
        }
        randomBtn.onclick = function () {
            app.isRandom = !app.isRandom
            app.setConfig('isRandom', app.isRandom)
            repeatBtn.classList.remove('active', app.isRepeat)
            app.isRepeat = false;
            randomBtn.classList.toggle('active', app.isRandom)
        }

        // Xử lý next song khi audio ended
        audio.onended = function () {
            nextBtn.click();
        }

        // Xử lý phát lại khi đang repeat
        repeatBtn.onclick = function () {
            app.isRepeat = !app.isRepeat
            app.setConfig('isRepeat', app.isRepeat)
            randomBtn.classList.remove('active', app.isRandom)
            app.isRandom = false
            repeatBtn.classList.toggle('active', app.isRepeat)
        }
        audio.onended = function () {
            if (app.isRepeat) {
                audio.play();
            }
            else {
                nextBtn.click();
            }
        }

        // Lắng nghe hành vi click vào playlist
        playlist.onclick = function (e) {
            const songNode = e.target.closest('.song:not(.active)');
            if (songNode || e.target.closest('.option')) {
                // Xử lý khi click vào song
                if (songNode) {
                    //   console.log(songNode.dataset.index) Giống songNode.getAttribute('data-index')
                    app.currentIndex = Number(songNode.dataset.index)
                    app.render()    
                    player.classList.add('playing')
                    app.isPlaying = true;
                    app.loadCurrentSong()
                    cdThumpAnimate.play()
                    audio.play();
                }
            }
        }
    },
    loadCurrentSong: function () {
        heading.textContent = this.currentSong.name
        cdThump.style.backgroundImage = `url('${this.currentSong.image}')`
        audio.src = this.currentSong.path
    },
    preSong: function () {
        this.currentIndex--;
        if (this.currentIndex < 0) {
            this.currentIndex = this.songs.length - 1;
        }
        this.loadCurrentSong()
    }
    ,
    nextSong: function () {
        this.currentIndex++
        if (this.currentIndex >= this.songs.length) {
            this.currentIndex = 0;
        }
        this.loadCurrentSong()
    },
    randomSong: function () {
        let newIndex;
        do {
            newIndex = Math.floor(Math.random() * this.songs.length)
        } while (newIndex === this.currentIndex)
        this.currentIndex = newIndex
        this.loadCurrentSong()
    },
    scrollToActiveSong: function () {
        setTimeout(() => {
            $('.song.active').scrollIntoView({
                behavior: "smooth",
                block: "nearest"
            })
        }, 300);
    },

    start: function () {
        // Định nghĩa các thuộc tính
        this.defineProperties();
        // Lắng nghe / xử lý các sự kiện (DOM events)
        this.handleEvents()
        this.loadCurrentSong()
        // Render playlist
        this.render();
    }
}

app.start();