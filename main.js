const canvas = document.querySelector('.canvas');
const ctx = canvas.getContext('2d');

const sprites = new Image();
sprites.src = 'assets/img/anh1.png';


canvas.height = 710;
canvas.width = 630;


class Bird {
    constructor(cX, cY) {
        this.cX = cX;
        this.cY = cY;

        this.animate = [
            { sX: 874, sY: 8 },
            { sX: 935, sY: 8 },
            { sX: 996, sY: 8 }
        ]
        this.sW = 60;
        this.sH = 40;

        this.cW = 60;
        this.cH = 40;
        this.i = 0;

        this.v =0;
        this.a = 0.08;
    }

    draw() {
        ctx.beginPath();
        if (game == 'start') {
            if (frame % 40 == 0) {
                this.i++;
                if (this.i > 2) {
                    this.i = 0;
                }
            }
        }
        if (game == 'play') {
            if (frame % 18 == 0) {
                this.i++;
                if (this.i > 2) {
                    this.i = 0;
                }
            }
        }
        ctx.drawImage(sprites, this.animate[this.i].sX, this.animate[this.i].sY, this.sW, this.sH, this.cX, this.cY,
            this.cW, this.cH);
    }
    update(delta = 1){
       if(game == 'play'){
            this.v += this.a * delta;
            this.cY += this.v * delta;

        
        // Kiểm tra va chạm với nền đất
        if(this.cY + this.cH + this.v >= 625)   {
            game = 'gameover';
            this.v = 0;
            this.cY = 625;
        } 
        // Kiểm tra va chạm với ống nước
        for (let i = 0; i < arrPipes.length; i++) {
            let p = arrPipes[i];

            // 1. Kiểm tra trục X (Chim có đang nằm trong chiều ngang của ống không?)
            if (this.cX + this.cW > p.cX && this.cX < p.cX + p.cW) {
                
                // 2. Kiểm tra trục Y (Chạm ống trên HOẶC chạm ống dưới)
                // - Chạm ống trên: Y của chim < mép dưới ống trên (p.cY)
                // - Chạm ống dưới: Y mép dưới của chim > mép trên ống dưới (p.cY + p.space)
                if (this.cY < p.cY || this.cY + this.cH > p.cY + p.space) {
                    game = 'gameover';
                    this.v = 0;
                    this.cY = 625; // Ép chim rơi xuống đất
                }
            }
        }
        // Trường hợp ăn điểm 
        for (let i = 0; i < arrPipes.length; i++) {
            let p = arrPipes[i];
            // Nếu mép trái của chim vượt qua mép phải của ống VÀ ống chưa được tính điểm
            if (this.cX > p.cX + p.cW && !p.passed) {
                score.value++;
                p.passed = true; // Đánh dấu đã ăn điểm để không cộng dồn liên tục
            }
        }
        
       }



    }

}

let game = 'start';
let frame = 0;
let bird = new Bird(150, canvas.height / 2 - 12);

const start = {
    draw: function () {
        ctx.beginPath();
        // Tăng sX từ 1012 lên 1085 để dịch vùng cắt sang phải, né hình con chim
        ctx.drawImage(sprites, 1096, 2, 228, 65, canvas.width / 2 - 114, 50, 228, 61);
        // Tương tự cho chữ Get Ready
        ctx.drawImage(sprites, 1079, 78, 263, 66, canvas.width / 2 - 118, 200, 236, 64);
        // Tăng sX từ 855 lên 872 để né cái viền ống nước màu xanh
        ctx.drawImage(sprites, 871, 157, 197, 150, canvas.width / 2 - 70, 350, 140, 126);
    }
}
class Ground {
    constructor(cX, cY) {
        this.cX = cX;
        this.cY = cY;

        // trong anh1.png và thay 4 số này bằng số của bạn nhé!
        this.sX = 650; // Cắt hẳn 8 pixel bên trái
        this.sY = 312;
        this.sW = 200; // Giảm hẳn chiều rộng xuống còn 200
        this.sH = 151;

        this.cW = 200;
        this.cH = 151;

        this.dx = -2;
    }

    draw() {
        ctx.beginPath();
        ctx.drawImage(sprites, this.sX, this.sY, this.sW, this.sH, this.cX, this.cY, this.cW, this.cH);
    }
}
// Tạo một mảng rỗng để chứa các miếng đất
// Tạo một mảng rỗng để chứa các miếng đất
const arrGround = [];

// Tăng lên 5 miếng đất để đảm bảo luôn phủ kín chiều rộng canvas (630px) khi cuộn
for (let i = 0; i < 5; i++) {
    // Ép các mảnh đất đứng sát nhau ở khoảng cách 199
    let ground = new Ground(199 * i, 625);
    arrGround.push(ground);
}

function drawArrGround() {
    arrGround.forEach(ground => ground.draw());
}

function updateArrGround(delta = 1) {
    const diff = getDifficulty();
    // Di chuyển toàn bộ các miếng đất sang trái theo độ khó hiện tại
    arrGround.forEach(ground => {
        ground.dx = -diff.groundSpeed;
        ground.cX += ground.dx * delta;
    });

    // Nếu miếng đất đầu tiên trôi hoàn toàn ra khỏi màn hình (vượt qua mức -199)
    if (arrGround[0].cX <= -199) {
        // Cắt miếng đất đầu tiên ra khỏi mảng
        let firstGround = arrGround.shift();

        // Nối nó vào ngay phía sau đuôi của miếng đất đang nằm cuối cùng trong mảng
        firstGround.cX = arrGround[arrGround.length - 1].cX + 199;

        // Nhét lại miếng đất này vào cuối mảng để tiếp tục vòng lặp
        arrGround.push(firstGround);
    }
}

//  ramdom ống trên và dưới 
function ramdom(min, max) {
    return Math.ceil(Math.random() * (max - min) + min);
}

// Cache độ khó để tránh tạo object mới mỗi frame
const DIFFICULTY_LEVELS = [
    { threshold: 0,  pipeSpeed: 1.5, groundSpeed: 2.0, spaceMin: 220, spaceMax: 260 },
    { threshold: 5,  pipeSpeed: 1.9, groundSpeed: 2.4, spaceMin: 200, spaceMax: 240 },
    { threshold: 10, pipeSpeed: 2.3, groundSpeed: 2.8, spaceMin: 180, spaceMax: 220 },
    { threshold: 15, pipeSpeed: 2.7, groundSpeed: 3.2, spaceMin: 165, spaceMax: 200 },
    { threshold: 20, pipeSpeed: 3.2, groundSpeed: 3.8, spaceMin: 150, spaceMax: 185 },
];

function getDifficulty() {
    const s = score.value;
    let level = DIFFICULTY_LEVELS[0];
    for (let i = DIFFICULTY_LEVELS.length - 1; i >= 0; i--) {
        if (s >= DIFFICULTY_LEVELS[i].threshold) {
            level = DIFFICULTY_LEVELS[i];
            break;
        }
    }
    return level;
}


// ==========================================
// CODE PIPES MỚI - CHỐNG LỖI CẮT NHẦM CHỮ
// ==========================================
class Pipes {
    constructor(cX, cY, space) {
        this.cX = cX;
        // cY bây giờ là Mép Dưới Cùng của ống trên (tức là vị trí bắt đầu khe hở)
        this.cY = cY;
        this.space = space; // Khoảng cách khe hở giữa 2 ống
        this.dx = -1.5;

        this.cW = 82; // Chiều rộng ống hiển thị
        this.mouth_cH = 40; // Chiều cao miệng ống hiển thị

        // TỌA ĐỘ AN TOÀN TUYỆT ĐỐI (Chỉ lấy góc trên cùng bên trái của ảnh gốc)
        this.sX = 0;

        // Cắt đúng cái miệng ống (Từ y=0 đến y=26)
        this.mouth_sY = 0;
        this.mouth_sW = 52;
        this.mouth_sH = 26;

        // Cắt một mẩu thân ống 10px cực kỳ sạch sẽ (Từ y=26 đến y=36)
        this.body_sY = 26;
        this.body_sW = 52;
        this.body_sH = 10;
        
        this.passed = false;
    }

    draw() {
        // --- 1. VẼ ỐNG TRÊN ---
        let topMouthY = this.cY - this.mouth_cH;
        // Kéo dãn thân ống từ trên trần nhà xuống chạm miệng
        ctx.drawImage(sprites, this.sX, this.body_sY, this.body_sW, this.body_sH,
            this.cX, 0, this.cW, topMouthY);

        // Vẽ miệng ống (Dùng hàm lật ngược hình của Canvas)
        ctx.save();
        ctx.translate(this.cX, this.cY); // Dời tâm về mép dưới ống trên
        ctx.scale(1, -1); // Lật ngược trục Y
        ctx.drawImage(sprites, this.sX, this.mouth_sY, this.mouth_sW, this.mouth_sH,
            0, 0, this.cW, this.mouth_cH);
        ctx.restore();

        // --- 2. VẼ ỐNG DƯỚI ---
        let bottomMouthY = this.cY + this.space;
        // Vẽ miệng ống (Không lật)
        ctx.drawImage(sprites, this.sX, this.mouth_sY, this.mouth_sW, this.mouth_sH,
            this.cX, bottomMouthY, this.cW, this.mouth_cH);

        // Kéo dãn thân ống từ dưới miệng chạm xuống đáy màn hình
        let bottomBodyY = bottomMouthY + this.mouth_cH;
        ctx.drawImage(sprites, this.sX, this.body_sY, this.body_sW, this.body_sH,
            this.cX, bottomBodyY, this.cW, canvas.height - bottomBodyY);
    }
}

const arrPipes = [];

for (let i = 1; i < 4; i++) {
    // Random mép dưới ống trên dao động từ y=100 đến y=350 để luôn có khe hở đẹp
    let pipe = new Pipes(ramdom(500, 600) * i, ramdom(80, 300), 250);
    arrPipes.push(pipe);
}

function drawArrPipes() {
    arrPipes.forEach(pipe => pipe.draw());
}

function updateArrPipes(delta = 1) {
    const diff = getDifficulty();
    arrPipes.forEach(pipe => {
        pipe.dx = -diff.pipeSpeed; // Cập nhật tốc độ theo độ khó hiện tại
        pipe.cX += pipe.dx * delta;
    });

    if (arrPipes[0].cX <= -82) { // 82 là cW của ống
        let firstPipe = arrPipes.shift();
        firstPipe.cX = arrPipes[arrPipes.length - 1].cX + ramdom(350, 450);

        // Random lại tọa độ khe hở theo độ khó hiện tại
        firstPipe.cY = ramdom(80, 300);
        firstPipe.space = ramdom(diff.spaceMin, diff.spaceMax);
        
        // Reset lại trạng thái tính điểm
        firstPipe.passed = false;

        arrPipes.push(firstPipe);
    }
}



// score


const arrNumber = [
    { name : 0 , sX : 1114 , sY : 232 , sW : 54 , sH : 82 , cW : 54 , cH : 82},
    { name : 1 , sX : 1171 , sY : 232 , sW : 54 , sH : 82 , cW : 54 , cH : 82},
    { name : 2 , sX : 1228 , sY : 232 , sW : 54 , sH : 82 , cW : 54 , cH : 82},
    { name : 3 , sX : 1285 , sY : 232 , sW : 54 , sH : 82 , cW : 54 , cH : 82},
    { name : 4 , sX : 1114 , sY : 316 , sW : 54 , sH : 81 , cW : 54 , cH : 82},
    { name : 5 , sX : 1171 , sY : 316 , sW : 54 , sH : 81 , cW : 54 , cH : 82},
    { name : 6 , sX : 1228 , sY : 316 , sW : 54 , sH : 81 , cW : 54 , cH : 82},
    { name : 7 , sX : 1285 , sY : 316 , sW : 54 , sH : 81 , cW : 54 , cH : 82},
    { name : 8 , sX : 1114 , sY : 400 , sW : 54 , sH : 81 , cW : 54 , cH : 82},
    { name : 9 , sX : 1171 , sY : 400 , sW : 54 , sH : 81 , cW : 54 , cH : 82},
];





class Score {
    constructor(value, cY) {
        this.value = value;
        // Bỏ cX đi vì chúng ta sẽ tự động tính toán X để căn giữa màn hình
        this.cY = cY; 
    }

    draw() {
        const scoreString = this.value.toString();
        const spritesToDraw = [];
        let totalWidth = 0;

        // 1. Tìm các sprite tương ứng với từng chữ số và tính tổng chiều rộng
        for (let i = 0; i < scoreString.length; i++) {
            // Ép kiểu chữ cái về số nguyên để so sánh với number.name
            const digit = parseInt(scoreString[i]); 
            
            // Dùng đúng tên mảng: arrNumber
            const sprite = arrNumber.find(num => num.name === digit); 
            
            if (sprite) {
                spritesToDraw.push(sprite);
                totalWidth += sprite.cW; // Cộng dồn chiều rộng của các chữ số
            }
        }

        // 2. Tính toán điểm bắt đầu vẽ (X) sao cho cả cụm điểm số nằm giữa canvas
        let startX = (canvas.width - totalWidth) / 2;

        // 3. Tiến hành vẽ từng số cạnh nhau
        spritesToDraw.forEach(sprite => {
            ctx.drawImage(
                sprites, 
                sprite.sX, sprite.sY, sprite.sW, sprite.sH, 
                startX, this.cY, sprite.cW, sprite.cH
            );
            
            // Dịch điểm vẽ sang phải cho số tiếp theo
            startX += sprite.cW; 
        });
    }
}

// Khi khởi tạo, bạn chỉ cần truyền vào điểm số và cao độ Y (ví dụ: cách mép trên 60px)
let score = new Score(0, 60);













// Background
const bg = {
    sX: 163,
    sY: 0,
    sW: 229,
    sH: 625,

    cX: 0,
    cY: 0,
    cW: 229,
    cH: 625,
    draw: function () {
        ctx.beginPath();
        ctx.drawImage(sprites, this.sX, this.sY, this.sW, this.sH, this.cX, this.cY, this.cW, this.cH);
        ctx.drawImage(sprites, this.sX, this.sY, this.sW, this.sH, this.cX + 229, this.cY, this.cW, this.cH);
        ctx.drawImage(sprites, this.sX, this.sY, this.sW, this.sH, this.cX + 458, this.cY, this.cW, this.cH);
    }
}

function handleInput() {
    switch (game) {
        case 'start':
            game = 'play';
            break;
        case 'play':
            bird.v = -3.5;
            break;
        case 'gameover':
            game = 'start';
            bird.v = 0;
            bird.cY = canvas.height / 2 - 12;
            bird.i = 0;
            score.value = 0;
            arrPipes.length = 0;
            for (let i = 1; i < 4; i++) {
                let pipe = new Pipes(ramdom(500, 600) * i, ramdom(80, 300), 250);
                arrPipes.push(pipe);
            }
            break;
    }
}

// Dùng pointerdown thay cho click: không có 300ms delay, hoạt động trên cả touch lẫn chuột
canvas.addEventListener('pointerdown', function (e) {
    e.preventDefault(); // Chặn scroll / zoom khi chạm
    handleInput();
});

// Giữ click cho môi trường không hỗ trợ pointer events
canvas.addEventListener('click', function (e) {
    e.preventDefault();
    handleInput();
});


function draw() {
    bg.draw();
    if (game == 'start') {
        start.draw();
    }
    
    drawArrPipes();
    drawArrGround();
    bird.draw();
    if (game == 'play' || game == 'gameover') {
        score.draw();
    }
    
}

function update(delta) {
    if (game == 'play') {
        updateArrPipes(delta);
        updateArrGround(delta);
    }
    bird.update(delta);
}

let lastTime = 0;
function animate(timestamp = 0) {
    requestAnimationFrame(animate);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    frame++;

    // Tính delta time, chuẩn hóa về 60fps (16.67ms/frame)
    // Cap ở 3 để tránh bước nhảy lớn khi tab bị ẩn
    const dt = timestamp - lastTime;
    lastTime = timestamp;
    const delta = Math.min(dt / 16.67, 3);

    update(delta);
    draw();
}
requestAnimationFrame(animate);

