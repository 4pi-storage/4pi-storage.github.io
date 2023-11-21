/* 検索結果を表示する関数 */
async function includerResult(_fileName, _id) {
    try {

        /* セッションストレージからデータを取得 */
        const word = sessionStorage.getItem("word");
        const ans = sessionStorage.getItem("ans");
        const now = sessionStorage.getItem("now");

        let numAns = ans.split(',').map(Number);
        let numNow = Number(now);

        if (numNow<1){
            numNow=1;
        };

        /* HTMLファイルを挿入 */
        const _responseHtml = await fetch("include/" + _fileName); /* ファイルパスからファイルを取得 */
        const _html = await _responseHtml.text(); /* テキスト情報を取得 */
        const _contents = document.querySelector("#" + _id); /* 挿入する箇所を探す。 */
        _contents.insertAdjacentHTML("afterbegin", _html); /* 指定箇所の最初に挿入 */

        /* 非同期を含まない(同期処理)pagenation */
        const _pagenation = document.querySelector('.pagenation'); /* 要素を挿入する元の要素を取得 */
        const _pagenationButton = _pagenation.querySelectorAll('.pageButton'); /* 子要素のボタンを全て取得 */
        const _changePage = (delta) => { /* addEvent～ではアロー関数しか使えないので適切に書いてある。 */
            return () => {
                numNow += delta; /* 現在のページと差を定義して */
                sessionStorage.setItem("now", numNow); /* セッションストレージにセット */
                window.location.href = 'serch-result.html'; /* ページ遷移 */
            };
        };
        _pagenationButton[0].addEventListener('click', _changePage(-1)); /* 最初のボタンには前に戻る操作を */
        _pagenationButton[_pagenationButton.length - 1].addEventListener('click', _changePage(1)); /* 最後ボタンには次に行く操作を */

        /* 検索結果を表示 */
        const title = document.querySelector('.serch-title');

        /* スプレットシートからデータをロードする関数 */
        async function _loadData() {

            /* データ表示 */
            const _apiURL = 'https://script.google.com/macros/s/AKfycbwr2_yBunIZqw2theL2eHCCs65-DvJ3QmNEoT0na5gHALdjlq3JE_RuC2ZLlVulLTqlTg/exec';  /* GoogleスプレッドシートのAPIキー */
            const _baseList = _contents.querySelector('.table-link'); /* これから作る要素のベース */
            const _articleList = _contents.querySelector('.article-list'); /* 要素を入れ込む要素を取得 */
            const _responseData = await fetch(_apiURL); /* apiのURLからデータを取得 */
            const _data = await _responseData.json(); /* json形式に変更 */
            const max = 3; /* ページに表示させるMax */
            const pageNum = Math.ceil(numAns.length/max); /* 全ページ数を計算 */
            if (numNow>pageNum){
                numNow = pageNum;
            };
            for (let i = max*(numNow-1); i <= max*(numNow)-1 ; i++){
                if(i <=numAns.length-1){
                    entry = _data[numAns[i]];
                    const date = new Date(entry.day);
                    // 年、月、日を取得
                    const year = date.getFullYear();
                    const month = date.getMonth() + 1; // 月は0から11の値で表されるため、+1する
                    const day = date.getDate();
                    // 年、月、日を指定のフォーマットに変換
                    const formattedDate = `${year}/${month}/${day}`;
                    const copy = _baseList.cloneNode(true);
                    copy.querySelector('.list-title').textContent = entry.title;
                    copy.setAttribute('onclick', "window.location.href="+"'"+entry.link+"'");
                    copy.querySelector('.list-img').src = entry.image;
                    copy.querySelector('.list-content').textContent = entry.content;
                    copy.querySelector('.list-update').textContent = formattedDate;
                    _articleList.appendChild(copy);
                }
                
            };

            /* 非同期を含むページネーション */
            /* 現在のページを表示 */
            const _nowPage = _contents.querySelector('.nowPage'); /* 挿入する箇所の要素を取得 */
            _nowPage.textContent = '現在は' + numNow + 'ページです。'; /* 現在のページを表示 */
            if(numNow === 1 ){
                _pagenationButton[1].style.cursor = 'default';
            }
            if(numNow === pageNum ){
                _pagenationButton[3].style.cursor = 'default';
            }
            _pagenationButton[3].textContent = pageNum;
            if (numNow === pageNum ){
                if(pageNum !==2){
                    _pagenationButton[2].textContent = '・・・';
                    _pagenationButton[4].parentNode.removeChild(_pagenationButton[4]);
                }else{
                    _pagenationButton[2].parentNode.removeChild(_pagenationButton[2]);
                    _pagenationButton[4].parentNode.removeChild(_pagenationButton[4]);
                };
            };
            if (numNow === 0 || numNow ===1){
                if(pageNum !==2){
                    _pagenationButton[2].textContent = '・・・';
                    _pagenationButton[0].parentNode.removeChild(_pagenationButton[0]);
                }else{
                    _pagenationButton[2].parentNode.removeChild(_pagenationButton[2]);
                    _pagenationButton[0].parentNode.removeChild(_pagenationButton[0]);
                };
            };
            if (numNow !== 0 & numNow !== 1){
                if(numNow !==pageNum){
                    _pagenationButton[2].textContent = numNow;
                };
            };
            if (pageNum === 1){
                _pagenationButton[2].parentNode.removeChild(_pagenationButton[2]);
                _pagenationButton[3].parentNode.removeChild(_pagenationButton[3]);
            };
            const first = () =>{
                if(numNow !== 1 ){
                    sessionStorage.setItem("now", 1);
                    window.location.href = 'all-article.html';
                };
            };
            const end = () =>{
                if (numNow !== pageNum ){
                    sessionStorage.setItem("now", pageNum);
                    window.location.href = 'all-article.html';
                };
                
            };
            _pagenationButton[1].addEventListener('click',first);
            _pagenationButton[3].addEventListener('click',end);
        }

        if (ans.length === 0 || word === null) {
            title.textContent = '検索結果はありませんでした。';
            title.style.textDecoration = 'underline';
        } else {
            title.textContent = '検索結果:' + word;
            _loadData();
        }

        const _base = _contents.querySelector('.js-base');
        if (_base) {
            _base.parentNode.removeChild(_base);
        }

    } catch (error) {
        console.error("Error occurred while including content: ", error);
    }
}

includerResult("serch-result-content.html", "main-content");

