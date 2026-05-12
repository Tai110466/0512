let video;
let faceMesh;
let faces = [];

// 用於平滑化耳環位置的變數
let smoothLeft = { x: 0, y: 0 };
let smoothRight = { x: 0, y: 0 };

function preload() {
  // 載入 ml5.js v1 的 faceMesh 模型
  // 在 preload 載入可確保 setup 執行前模型已準備就緒
  faceMesh = ml5.faceMesh({ maxFaces: 1, refineLandmarks: false, flipHorizontal: false });
}

function setup() {
  // 建立全螢幕畫布
  createCanvas(windowWidth, windowHeight);
  // 擷取攝影機影像
  video = createCapture(VIDEO, (stream) => {
    console.log("攝影機已啟動");
    // 確保攝影機啟動後再開始偵測
    faceMesh.detectStart(video, gotFaces);
  });
  video.size(640, 480); // 設定固定解析度以利辨識座標對應
  video.hide();
}

function gotFaces(results) {
  // 將辨識結果存入 faces 變數
  faces = results;
}

function draw() {
  // 繪製酷酷的動態漸層背景與星點
  drawCoolBackground();

  let w = width * 0.5; // 畫布寬度的 50%
  let h = height * 0.5; // 畫布高度的 50%
  let x = (width - w) / 2; // 置中水平座標
  let y = (height - h) / 2; // 置中垂直座標

  push();
  // 將座標系移動到影像預定位置的右緣，準備進行翻轉
  translate(x + w, y);
  // 水平翻轉 (x 軸 -1)
  scale(-1, 1);

  // 幫影像加一個科技感的發光邊框
  noFill();
  stroke(255, 255, 0, 150);
  strokeWeight(3);
  rect(-3, -3, w + 6, h + 6, 10);

  // 繪製影像
  image(video, 0, 0, w, h);

  // 若辨識到臉部，則在左右耳垂處畫出三個黃色圓圈 (耳環效果)
  if (faces.length > 0) {
    let face = faces[0];
    
    // 取得新的特徵點 (177: 左耳垂, 401: 右耳垂)
    let ptL = face.keypoints[177];
    let ptR = face.keypoints[401];

    if (ptL && ptR) {
      // 使用 lerp 進行平滑化處理，0.1 比 0.2 更穩但會稍微慢一點點
      smoothLeft.x = lerp(smoothLeft.x, ptL.x, 0.1);
      smoothLeft.y = lerp(smoothLeft.y, ptL.y, 0.1);
      smoothRight.x = lerp(smoothRight.x, ptR.x, 0.1);
      smoothRight.y = lerp(smoothRight.y, ptR.y, 0.1);

      drawEarring(smoothLeft, w, h);
      drawEarring(smoothRight, w, h);
    }
  }
  pop();

  // --- 文字移到最上層繪製 ---
  fill(255); // 白色文字在深色背景更明顯
  textSize(32); // 放大一點比較清楚
  textAlign(CENTER, TOP);
  
  // 為文字加上霓虹發光效果
  drawingContext.shadowBlur = 20;
  drawingContext.shadowColor = 'yellow';
  text("412730227陳永泰", width / 2, 30);
  text("作品為影像辨識_耳環臉譜", width / 2, 75);
  drawingContext.shadowBlur = 0; // 取消發光避免影響後續繪圖
}

function drawCoolBackground() {
  // 繪製深藍色調的動態漸層
  noStroke();
  for (let i = 0; i <= height; i += 10) {
    let inter = map(i, 0, height, 0, 1);
    // 產生深邃的星空色調
    let c = lerpColor(color('#0f0c29'), color('#302b63'), inter);
    fill(c);
    rect(0, i, width, 10);
  }
  
  // 增加一些閃爍的動態光點（星星）
  fill(255, 255, 255, 80);
  for (let i = 0; i < 40; i++) {
    let xStar = noise(i, frameCount * 0.002) * width;
    let yStar = noise(i + 10, frameCount * 0.002) * height;
    let size = noise(i + 20, frameCount * 0.01) * 6;
    circle(xStar, yStar, size);
  }
}

function drawEarring(pt, imgW, imgH) {
  if (!pt) return;
  // 將偵測到的影片座標對應到畫面上顯示的影像大小
  let px = map(pt.x, 0, video.width, 0, imgW);
  let py = map(pt.y, 0, video.height, 0, imgH);

  // 讓耳環也有發光感
  drawingContext.shadowBlur = 15;
  drawingContext.shadowColor = 'yellow';
  fill(255, 255, 0); // 設定圓圈顏色為黃色
  noStroke();
  // 由耳垂位置開始，垂直向下畫出三個圓圈
  for (let i = 0; i < 3; i++) {
    // 讓圓圈往下稍微變小，看起來更自然
    circle(px, py + (i + 1) * 15, 10 - i * 2);
  }
  drawingContext.shadowBlur = 0;
}

function windowResized() {
  // 當視窗大小改變時，重新調整畫布大小
  resizeCanvas(windowWidth, windowHeight);
}