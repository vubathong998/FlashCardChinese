function main() {

    const urlData = '../data/data.xlsx';

    const btnChinese = document.getElementsByClassName('header_btn-chinese')[0];
    const btnBietnamese = document.getElementsByClassName('header_btn-vietnamese')[0];
    const btnEnglish = document.getElementsByClassName('header_btn-english')[0];
    const btnPinin = document.getElementsByClassName('header_btn-pinin')[0];
    // const btnRandom = document.getElementsByClassName('header_btn-random')[0];
    const btnPrev = document.getElementsByClassName('header_btn-prev')[0];
    const btnNext = document.getElementsByClassName('header_btn-next')[0];
    const checkboxRandom = document.getElementsByClassName('header_checkbox_random')[0];
    const btnRank = document.getElementsByClassName('header_btn-rank')[0];

    // const showSecond = document.getElementsByClassName('hide_second')[0];
    // const showthird = document.getElementsByClassName('hide_third')[0];
    // const showfourth = document.getElementsByClassName('hide_fourth')[0];

    const blockMainShow = document.getElementsByClassName('body_block-main_show')[0];
    const blockFirst = document.getElementsByClassName('body_block-first')[0];
    const blockSecond = document.getElementsByClassName('body_block-second')[0];
    const blockThird = document.getElementsByClassName('body_block-third')[0];
    const blockExample = document.getElementsByClassName('body_block-example')[0];
    const blockShowAll = document.getElementsByClassName('body_block-showAll')[0];

    var oldContent = '';

    const typingPlace = document.getElementsByClassName('typing-place')[0];
    let oldIndex = -1;


    //get data from google sheet
    fetch('https://docs.google.com/spreadsheets/d/1C_JtpNZzgy0iFdmt8oPAunVPQnihENhSIsD2L7H2Wd0/export?format=csv')
        .then(res => res.text())
        .then(csv => {
            const rows = csv
                .trim()
                .split('\n')
                .map(row => row.split(','));
            const [header, ...data] = rows;
            return data;
        })
        .then(data => {
            handle(data);

        })
        .catch(err => console.error('Sheet error:', err));

    //get data from excel file
    // fetch(urlData)
    //     .then(res => res.arrayBuffer())
    //     .then(buffer => {
    //         const workbook = XLSX.read(buffer, { type: "array" });

    //         const firstSheetName = workbook.SheetNames[0];
    //         const sheet = workbook.Sheets[workbook.SheetNames[0]];

    //         const data = XLSX.utils.sheet_to_json(sheet, { header: 1 });
    //         return data;
    //     })
    //     .then(data => {
    //         handle(data);
    //     })
    //     .catch(err => console.error(err));

    //main function
    function handle(data) {
        let dataMapped = mapper(data);
        dataMapped = dataMapped.filter(item => item.chinese && item.chinese.trim() !== '');
        let dataFiltered = [...dataMapped];
        const appearingRanks = createRankFilterE(dataMapped);

        let currentPos = 0;
        let isShown = false;
        let selectedLanguage = 'chinese';


        function sortFiltered() {
            if (checkboxRandom && checkboxRandom.checked) {
                dataMapped = shuffleRandomIndex(dataMapped);
                dataFiltered.sort((a, b) => (a.randomIndex || 0) - (b.randomIndex || 0));
            } else {
                dataFiltered.sort((a, b) => (a.coreIndex || 0) - (b.coreIndex || 0));
            }
        }

        function displayCurrent() {
            if (dataFiltered.length === 0) {
                blockMainShow.textContent = 'No data';
                return;
            }
            if (currentPos < 0) currentPos = dataFiltered.length - 1;
            if (currentPos >= dataFiltered.length) currentPos = 0;
            isShown = false;
            updateDisplay();
        }

        function navigate(delta) {
            if (dataFiltered.length === 0) return;
            const prevChinese = dataFiltered[currentPos] ? dataFiltered[currentPos].chinese : '';
            let attempts = 0;
            do {
                currentPos = currentPos + delta;
                if (currentPos < 0) currentPos = dataFiltered.length - 1;
                if (currentPos >= dataFiltered.length) currentPos = 0;
                attempts++;
                if (attempts > dataFiltered.length) break;
            } while (dataFiltered[currentPos] && dataFiltered[currentPos].chinese === prevChinese);
            isShown = false;
            updateDisplay();
        }

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                toggleDisplay();
            }
            else if (e.ctrlKey && e.code === 'Space') {
                e.preventDefault();
                navigate(-1);
            }
            else if (e.key === ' ' || e.code === 'Space') {
                e.preventDefault();
                navigate(1);
            }
        });

        if (btnNext) btnNext.addEventListener('click', () => navigate(1));
        if (btnPrev) btnPrev.addEventListener('click', () => navigate(-1));
        if (checkboxRandom) checkboxRandom.addEventListener('change', () => {
            sortFiltered();
            displayCurrent();
        });

        const clickableSelectors = ['.body_block-main_show', '.body_block-first', '.body_block-second', '.body_block-third', '.body_block-example', '.body_block-showAll'];
        clickableSelectors.forEach(sel => {
            const el = document.querySelector(sel);
            if (el) {
                el.style.cursor = 'pointer';
                const container = el.closest('.soft-bg-animate') || el;
                container.addEventListener('click', () => {
                    if (window.innerWidth <= 768) {
                        toggleDisplay();
                    }
                });
            }
        });

        let touchStartX = null;
        let touchStartY = null;
        const SWIPE_THRESHOLD = 50;
        document.addEventListener('touchstart', (e) => {
            if (e.touches && e.touches.length === 1) {
                touchStartX = e.touches[0].clientX;
                touchStartY = e.touches[0].clientY;
            }
        }, { passive: true });

        document.addEventListener('touchend', (e) => {
            if (touchStartX === null) return;
            const touchEndX = (e.changedTouches && e.changedTouches[0]) ? e.changedTouches[0].clientX : null;
            const touchEndY = (e.changedTouches && e.changedTouches[0]) ? e.changedTouches[0].clientY : null;
            if (touchEndX === null) {
                touchStartX = null; touchStartY = null; return;
            }
            const dx = touchEndX - touchStartX;
            const dy = touchStartY - touchEndY;
            if (Math.abs(dx) > SWIPE_THRESHOLD && window.innerWidth <= 768) {
                if (dx < 0) {
                    navigate(1);
                }
                else {
                    navigate(-1);
                }
            }
            touchStartX = null; touchStartY = null;
        }, { passive: true });

        btnChinese.addEventListener('click', () => selectLanguage('chinese'));
        btnBietnamese.addEventListener('click', () => selectLanguage('vietnamese'));
        btnEnglish.addEventListener('click', () => selectLanguage('english'));
        btnPinin.addEventListener('click', () => selectLanguage('pinin'));

        btnRank.addEventListener('change', () => {
            applyFilter();
            sortFiltered();
            displayCurrent();
        });
        document.querySelector('.header_btn-point').addEventListener('change', () => {
            applyFilter();
            sortFiltered();
            displayCurrent();
        });

        function toggleDisplay() {
            isShown = !isShown;
            updateDisplay();
        }

        function updateDisplay() {
            const item = dataFiltered[currentPos];
            if (!item) return;

            const languageMap = {
                'chinese': {
                    main: 'chinese',
                    first: 'vietnamese',
                    third: 'english',
                    second: 'pinin'
                },
                'vietnamese': {
                    main: 'vietnamese',
                    first: 'chinese',
                    third: 'english',
                    second: 'pinin'
                },
                'english': {
                    main: 'english',
                    first: 'chinese',
                    third: 'vietnamese',
                    second: 'pinin'
                },
                'pinin': {
                    main: 'pinin',
                    first: 'chinese',
                    third: 'vietnamese',
                    second: 'english'
                }
            };

            const config = languageMap[selectedLanguage];

            if (!isShown) {
                blockMainShow.textContent = getFieldValue(item, config.main);
                blockFirst.textContent = '****';
                blockSecond.textContent = '****';
                blockThird.textContent = '****';
                blockExample.textContent = '****';
                blockShowAll.textContent = '****';
            } else {
                function blockShowAllContent() {
                    let showAllContent = '';
                    if (item.classifier || item.classPinin || item.category) {
                        if (item.classifier && item.classifier.trim() !== '-' && item.classifier.trim() !== '—') {
                            showAllContent += item.classifier;
                        }
                        else {
                            showAllContent += 'Trống-None-无内容';
                        }
                        if (item.classPinin && item.classPinin.trim() !== '-' && item.classPinin.trim() !== '—') {
                            showAllContent += ' | ' + item.classPinin;
                        }
                        else {
                            showAllContent += ' | Trống-None-无内容';
                        }
                        if (item.category && item.category.trim() !== '-' && item.category.trim() !== '—') {
                            showAllContent += ' | ' + item.category;
                        }
                        else {
                            showAllContent += ' | Trống-None-无内容';
                        }
                    }
                    else {
                        showAllContent = 'Trống-None-无内容';
                    }
                    return showAllContent;
                };

                blockMainShow.textContent = getFieldValue(item, config.main);
                blockFirst.textContent = getFieldValue(item, config.first);
                blockSecond.textContent = getFieldValue(item, config.second);
                blockThird.textContent = getFieldValue(item, config.third);
                blockExample.textContent = item.example || 'Trống-None-无内容';
                blockShowAll.textContent = blockShowAllContent();
            }
        }

        function getFieldValue(item, field) {
            switch (field) {
                case 'chinese': return item.chinese || '';
                case 'vietnamese': return item.vietnamese || '';
                case 'english': return item.english || '';
                case 'pinin': return `${item.pinin || ''} ${item.classPinin && item.classPinin.trim() !== '-' && item.classPinin !== '—' ? `(${item.classPinin})` : ''}`.trim();
                default: return '';
            }
        }

        function selectLanguage(lang) {
            selectedLanguage = lang;
            updateDisplay();
            updateButtonStates(lang);
        }

        function updateButtonStates(lang) {
            [btnChinese, btnBietnamese, btnEnglish, btnPinin].forEach(btn => btn.classList.remove('bg-purple-500', 'text-white'));

            const buttonMap = {
                'chinese': btnChinese,
                'vietnamese': btnBietnamese,
                'english': btnEnglish,
                'pinin': btnPinin
            };

            if (buttonMap[lang]) {
                buttonMap[lang].classList.add('bg-purple-500', 'text-white');
            }
        }

        function applyFilter() {
            const selectedRank = btnRank.value;
            const selectedPoint = document.querySelector('.header_btn-point').value;

            dataFiltered = dataMapped.filter(item => {
                const rankMatch = selectedRank === '0' || item.rank === selectedRank;
                const pointMatch = selectedPoint === '0' || item.point <= Number(selectedPoint);
                const hasChineseMatch = item.chinese && item.chinese.trim() !== '';
                return rankMatch && pointMatch && hasChineseMatch;
            });

            if (dataFiltered.length > 0) {
                currentPos = 0;
            } else {
                blockMainShow.textContent = 'No matching items';
            }
        }

        function createRankFilterE(dataMapped) {
            const appearingRanks = [];
            dataMapped.forEach(item => {
                if (item.rank && item.rank.toString().trim() !== '') {
                    const val = item.rank.toString();
                    if (!appearingRanks.includes(val)) {
                        appearingRanks.push(val);
                    }
                }
            });
            appearingRanks.sort((a, b) => {
                const na = Number(a);
                const nb = Number(b);
                if (!isNaN(na) && !isNaN(nb)) return na - nb;
                return a.localeCompare(b);
            });
            appearingRanks.forEach(rank => {
                const option = document.createElement('option');
                option.value = rank;
                option.textContent = rank;
                btnRank.appendChild(option);
            });
            return appearingRanks;
        }

        sortFiltered();
        displayCurrent();
        updateButtonStates('chinese');

    }

    function mapper(dataMapper) {
        let dataMapped = [];
        for (let i = 0; i < dataMapper.length; i++) {
            dataMapped.push({
                id: dataMapper[i][0],
                coreIndex: i,
                randomIndex: i,
                point: dataMapper[i][1],
                chinese: dataMapper[i][2],
                classifier: dataMapper[i][3],
                pinin: dataMapper[i][4],
                classPinin: dataMapper[i][5],
                english: dataMapper[i][6],
                vietnamese: dataMapper[i][7],
                type: dataMapper[i][8],
                example: dataMapper[i][9],
                category: dataMapper[i][10],
                rank: dataMapper[i][11],
            })
        }
        dataMapped = shuffleRandomIndex(dataMapped);
        return dataMapped;
    }
    function shuffleRandomIndex(arr) {
        const length = arr.length;
        const indexes = arr.map(item => item.randomIndex);
        if (!indexes.length || indexes.every(v => v === undefined)) {
            for (let i = 0; i < length; i++) {
                indexes[i] = i;
            }
        }
        for (let i = length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [indexes[i], indexes[j]] = [indexes[j], indexes[i]];
        }
        for (let i = 0; i < length; i++) {
            arr[i].randomIndex = indexes[i];
        }
        return arr;
    }

}
main();