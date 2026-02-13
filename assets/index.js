function main() {

    const urlData = '../data/data.xlsx';

    const btnChinese = document.getElementsByClassName('header_btn-chinese')[0];
    const btnBietnamese = document.getElementsByClassName('header_btn-vietnamese')[0];
    const btnEnglish = document.getElementsByClassName('header_btn-english')[0];
    const btnPinin = document.getElementsByClassName('header_btn-pinin')[0];
    const btnRandom = document.getElementsByClassName('header_btn-random')[0];
    const btnRank = document.getElementsByClassName('header_btn-rank')[0];

    const showSecond = document.getElementsByClassName('hide_second')[0];
    const showthird = document.getElementsByClassName('hide_third')[0];
    const showfourth = document.getElementsByClassName('hide_fourth')[0];

    const blockMainShow = document.getElementsByClassName('body_block-main_show')[0];
    const blockFirst = document.getElementsByClassName('body_block-first')[0];
    const blockSecond = document.getElementsByClassName('body_block-second')[0];
    const blockThird = document.getElementsByClassName('body_block-third')[0];
    const blockExample = document.getElementsByClassName('body_block-example')[0];

    const typingPlace = document.getElementsByClassName('typing-place')[0];

    //get data from google sheet
    fetch('https://docs.google.com/spreadsheets/d/1C_JtpNZzgy0iFdmt8oPAunVPQnihENhSIsD2L7H2Wd0/export?format=csv')
        .then(res => res.text())
        .then(csv => {
            const rows = csv
                .trim()
                .split('\n')
                .map(row => row.split(','));
            // Nếu muốn bỏ header
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
        const appearingRanks = createRankFilterE(dataMapped);

        

        function createRankFilterE(dataMapped) {
            let appearingRanks = [];
            appearingRanks.push(dataMapped[0].rank);
            dataMapped.forEach(item => {
                if (item.rank) {
                    let isDuplicate = false;
                    for (let i = 0; i < appearingRanks.length; i++) {
                        if (item.rank === appearingRanks[i]) {
                            isDuplicate = true;
                            break;
                        }
                    }
                    if (!isDuplicate) {
                        appearingRanks.push(item.rank);
                    }
                }
            });

            // const uniqueRanks = [...new Set(dataMapped.map(item => item.rank))];
            appearingRanks.forEach(rank => {
                const option = document.createElement('option');
                option.value = rank;
                option.textContent = rank;
                btnRank.appendChild(option);
            });
            return appearingRanks;
        }

    }

    function mapper(dataMapper) {
        let dataMapped = [];
        for (let i = 0; i < dataMapper.length; i++) {
            dataMapped.push({
                id: dataMapper[i][0],
                point: dataMapper[i][1],
                chinese: dataMapper[i][2],
                classifier: dataMapper[i][3],
                pinin: dataMapper[i][4],
                classPinin: dataMapper[i][5],
                english: dataMapper[i][6],
                vietnamese: dataMapper[i][7],
                type: dataMapper[i][8],
                category: dataMapper[i][9],
                rank: dataMapper[i][10],
            })
        }
        return dataMapped;
    }
    function randomNumber(number) {
        return Math.floor(Math.random() * number);
    }
}
main();