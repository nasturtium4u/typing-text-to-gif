// ============================================
// DOM
// ============================================

const textInput =
    document.getElementById("textInput");

const widthInput =
    document.getElementById("width");

const heightInput =
    document.getElementById("height");

const fontSizeInput =
    document.getElementById("fontSize");

const fpsModeInput =
    document.getElementById("fpsMode");

const backgroundInput =
    document.getElementById("background");

const textColorInput =
    document.getElementById("textColor");

const cursorColorInput =
    document.getElementById("cursorColor");

const cursorInput =
    document.getElementById("cursor");


const generateBtn =
    document.getElementById("generateBtn");

const clearBtn =
    document.getElementById("clearBtn");

const resetBtn =
    document.getElementById("resetBtn");


const changesCount =
    document.getElementById("changesCount");

const charsCount =
    document.getElementById("charsCount");

const duration =
    document.getElementById("duration");


const progressWrap =
    document.getElementById("progressWrap");

const progressBar =
    document.getElementById("progressBar");

const progressText =
    document.getElementById("progressText");

const progressPercent =
    document.getElementById("progressPercent");


const preview =
    document.getElementById("preview");

const status =
    document.getElementById("status");


// ============================================
// HISTORY
// ============================================

let history = [];

let recordingStartedAt =
    performance.now();

let isGenerating = false;


// ============================================
// INITIAL STATE
// ============================================

history.push({
    text: "",
    timestamp: recordingStartedAt,

    selectionStart: 0,
    selectionEnd: 0,

    inputType: "initial",
    data: null
});


updateStats();


// ============================================
// RECORD EVERY REAL INPUT
// ============================================

textInput.addEventListener(
    "input",
    (event) => {

        const now =
            performance.now();

        history.push({

            text: textInput.value,

            timestamp: now,

            selectionStart:
                textInput.selectionStart,

            selectionEnd:
                textInput.selectionEnd,

            inputType:
                event.inputType || "input",

            data:
                event.data ?? null
        });


        updateStats();
    }
);


// ============================================
// STATS
// ============================================

function updateStats() {

    changesCount.textContent =
        Math.max(
            0,
            history.length - 1
        );


    charsCount.textContent =
        textInput.value.length;


    if (
        history.length > 1
    ) {

        const first =
            history[0].timestamp;

        const last =
            history[
                history.length - 1
            ].timestamp;

        const seconds =
            Math.max(
                0,
                (last - first) / 1000
            );

        duration.textContent =
            `${seconds.toFixed(1)} сек.`;

    } else {

        duration.textContent =
            "0 сек.";
    }
}


// ============================================
// CLEAR TEXT
// ============================================

clearBtn.addEventListener(
    "click",
    () => {

        if (isGenerating) {
            return;
        }

        textInput.value = "";

        textInput.focus();

        const now =
            performance.now();

        history.push({

            text: "",

            timestamp: now,

            selectionStart: 0,

            selectionEnd: 0,

            inputType: "clear",

            data: null
        });

        updateStats();
    }
);


// ============================================
// RESET HISTORY
// ============================================

resetBtn.addEventListener(
    "click",
    () => {

        if (isGenerating) {
            return;
        }

        const now =
            performance.now();

        recordingStartedAt = now;

        history = [
            {
                text: textInput.value,

                timestamp: now,

                selectionStart:
                    textInput.selectionStart,

                selectionEnd:
                    textInput.selectionEnd,

                inputType: "reset",

                data: null
            }
        ];

        preview.innerHTML =
            "GIF появится здесь после генерации.";

        status.textContent = "";

        updateStats();
    }
);


// ============================================
// TEXT WRAPPING
// ============================================

function wrapText(
    ctx,
    text,
    maxWidth,
    lineHeight
) {

    const lines = [];

    const paragraphs =
        text.split("\n");


    for (
        const paragraph
        of paragraphs
    ) {

        if (paragraph === "") {

            lines.push("");

            continue;
        }


        const words =
            paragraph.split(" ");

        let line = "";


        for (
            const word
            of words
        ) {

            const testLine =
                line
                    ? `${line} ${word}`
                    : word;


            const metrics =
                ctx.measureText(
                    testLine
                );


            if (
                metrics.width > maxWidth &&
                line
            ) {

                lines.push(line);

                line = word;

            } else {

                line = testLine;
            }
        }


        lines.push(line);
    }


    return lines;
}


// ============================================
// DRAW FRAME
// ============================================

function drawFrame(
    canvas,
    state,
    options
) {

    const ctx =
        canvas.getContext(
            "2d",
            {
                willReadFrequently: true
            }
        );


    const {
        width,
        height,
        fontSize,
        background,
        textColor,
        cursorColor,
        cursorType
    } = options;


    ctx.clearRect(
        0,
        0,
        width,
        height
    );


    // Background

    ctx.fillStyle =
        background;

    ctx.fillRect(
        0,
        0,
        width,
        height
    );


    // Text

    ctx.fillStyle =
        textColor;

    ctx.font =
        `${fontSize}px "Courier New", monospace`;

    ctx.textBaseline =
        "top";


    const padding = 30;

    const lineHeight =
        Math.round(
            fontSize * 1.5
        );


    const maxWidth =
        width -
        padding * 2;


    const lines =
        wrapText(
            ctx,
            state.text,
            maxWidth,
            lineHeight
        );


    let y = padding;


    for (
        const line
        of lines
    ) {

        ctx.fillText(
            line,
            padding,
            y
        );

        y += lineHeight;
    }


    // Cursor

    if (
        cursorType === "none"
    ) {
        return;
    }


    const position =
        state.selectionStart;


    const beforeCursor =
        state.text.substring(
            0,
            position
        );


    const beforeLines =
        wrapText(
            ctx,
            beforeCursor,
            maxWidth,
            lineHeight
        );


    let cursorX =
        padding;

    let cursorY =
        padding;


    if (
        beforeLines.length > 0
    ) {

        const lastLine =
            beforeLines[
                beforeLines.length - 1
            ];


        cursorX +=
            ctx.measureText(
                lastLine
            ).width;


        cursorY +=
            (
                beforeLines.length - 1
            ) *
            lineHeight;
    }


    ctx.fillStyle =
        cursorColor;


    if (
        cursorType === "line"
    ) {

        ctx.fillRect(
            cursorX,
            cursorY,
            2,
            fontSize * 1.15
        );

    } else if (
        cursorType === "block"
    ) {

        ctx.globalAlpha = 0.35;

        ctx.fillRect(
            cursorX,
            cursorY,
            Math.max(
                8,
                fontSize * 0.6
            ),
            fontSize * 1.15
        );

        ctx.globalAlpha = 1;
    }
}


// ============================================
// FRAME DELAY
// ============================================

function calculateDelay(
    current,
    next,
    mode
) {

    let delay =
        next.timestamp -
        current.timestamp;


    if (
        !Number.isFinite(delay)
    ) {
        delay = 100;
    }


    if (mode === "fast") {

        delay *= 0.45;

    } else if (
        mode === "slow"
    ) {

        delay *= 1.7;
    }


    return clamp(
        delay,
        20,
        3000
    );
}


// ============================================
// GENERATE GIF
// ============================================

async function generateGif() {

    if (isGenerating) {
        return;
    }


    if (
        typeof window.GIF !==
        "function"
    ) {

        status.textContent =
            "Ошибка: gif.js не найден.";

        return;
    }


    if (
        history.length === 0
    ) {

        status.textContent =
            "Нет данных для генерации.";

        return;
    }


    isGenerating = true;

    generateBtn.disabled = true;
    clearBtn.disabled = true;
    resetBtn.disabled = true;


    preview.innerHTML =
        "Создание GIF...";


    status.textContent = "";


    progressWrap.classList.remove(
        "hidden"
    );


    updateProgress(
        0,
        "Подготовка кадров..."
    );


    const options = {

        width: clamp(
            parseInt(
                widthInput.value,
                10
            ) || 800,
            200,
            2000
        ),

        height: clamp(
            parseInt(
                heightInput.value,
                10
            ) || 450,
            100,
            1500
        ),

        fontSize: clamp(
            parseInt(
                fontSizeInput.value,
                10
            ) || 28,
            10,
            100
        ),

        background:
            backgroundInput.value,

        textColor:
            textColorInput.value,

        cursorColor:
            cursorColorInput.value,

        cursorType:
            cursorInput.value,

        fpsMode:
            fpsModeInput.value
    };


    const canvas =
        document.createElement(
            "canvas"
        );


    canvas.width =
        options.width;

    canvas.height =
        options.height;


    let gif;


    try {

        gif = new GIF({

            workers: 2,

            quality: 10,

            width: options.width,

            height: options.height,

            workerScript:
                "./gif.worker.js"
        });

    } catch (error) {

        console.error(error);

        status.textContent =
            "Не удалось запустить GIF encoder.";

        finishGeneration();

        return;
    }


    // ========================================
    // ADD FRAMES
    // ========================================

    for (
        let i = 0;
        i < history.length;
        i++
    ) {

        const current =
            history[i];


        drawFrame(
            canvas,
            current,
            options
        );


        let delay = 100;


        if (
            i <
            history.length - 1
        ) {

            delay =
                calculateDelay(
                    current,
                    history[i + 1],
                    options.fpsMode
                );

        } else {

            // Последний кадр
            delay = 800;
        }


        gif.addFrame(
            canvas,
            {
                copy: true,
                delay: delay
            }
        );


        const preparationProgress =
            Math.round(
                (
                    (i + 1) /
                    history.length
                ) * 60
            );


        updateProgress(
            preparationProgress,
            "Подготовка кадров..."
        );


        // Даём браузеру обновить интерфейс

        await nextFrame();
    }


    // ========================================
    // GIF PROGRESS
    // ========================================

    gif.on(
        "progress",
        (progress) => {

            const percent =
                60 +
                Math.round(
                    progress * 40
                );


            updateProgress(
                percent,
                "Кодирование GIF..."
            );
        }
    );


    // ========================================
    // FINISHED
    // ========================================

    gif.on(
        "finished",
        (blob) => {

            updateProgress(
                100,
                "Готово!"
            );


            const url =
                URL.createObjectURL(
                    blob
                );


            preview.innerHTML = "";


            const img =
                document.createElement(
                    "img"
                );


            img.src = url;

            img.alt =
                "Сгенерированный GIF";


            preview.appendChild(img);


            // Download button

            const download =
                document.createElement(
                    "a"
                );


            download.href =
                url;

            download.download =
                "typing-animation.gif";

            download.textContent =
                "Скачать GIF";


            download.className =
                "download-button";


            download.style.display =
                "inline-flex";

            download.style.marginTop =
                "15px";

            download.style.padding =
                "10px 16px";

            download.style.borderRadius =
                "9px";

            download.style.background =
                "#3b82f6";

            download.style.color =
                "#fff";

            download.style.textDecoration =
                "none";


            preview.appendChild(
                document.createElement(
                    "br"
                )
            );


            preview.appendChild(
                download
            );


            status.textContent =
                `GIF создан. Кадров: ${history.length}.`;


            finishGeneration();
        }
    );


    // ========================================
    // ABORT
    // ========================================

    gif.on(
        "abort",
        () => {

            status.textContent =
                "Генерация GIF была прервана.";

            finishGeneration();
        }
    );


    // ========================================
    // RENDER
    // ========================================

    try {

        gif.render();

    } catch (error) {

        console.error(error);

        status.textContent =
            "Ошибка при запуске генерации GIF.";

        finishGeneration();
    }
}


// ============================================
// PROGRESS
// ============================================

function updateProgress(
    percent,
    text
) {

    const value =
        clamp(
            percent,
            0,
            100
        );


    progressBar.style.width =
        `${value}%`;


    progressPercent.textContent =
        `${value}%`;


    progressText.textContent =
        text;
}


// ============================================
// FINISH
// ============================================

function finishGeneration() {

    isGenerating = false;

    generateBtn.disabled = false;
    clearBtn.disabled = false;
    resetBtn.disabled = false;
}


// ============================================
// HELPERS
// ============================================

function clamp(
    value,
    min,
    max
) {

    return Math.min(
        Math.max(
            value,
            min
        ),
        max
    );
}


function nextFrame() {

    return new Promise(
        resolve => {

            requestAnimationFrame(
                () => resolve()
            );

        }
    );
}


// ============================================
// GENERATE BUTTON
// ============================================

generateBtn.addEventListener(
    "click",
    generateGif
);
