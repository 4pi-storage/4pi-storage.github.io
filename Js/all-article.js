/* 全記事一覧を表示させるための関数 */
async function includerAll(_fileName, _id) {
    try {

        /* セッションストレージからデータを取得 */
        const now = sessionStorage.getItem("now"); /* now(現在のページ)を取得 */
        let numNow = Number(now); /* 数値に変更 */
        if (numNow<1){
            numNow=1; /* 1より小さかったら1ページに戻す。 */
        };

        /* htmlファイルを挿入 */
        const _responseHTML = await fetch("include/" + _fileName); /* ファイルパスからファイルを非同期で取得 */
        const _html = await _responseHTML.text(); /* ファイルのテキスト情報を取得 */
        const _contents = document.querySelector("#" + _id); /* 挿入する箇所の要素を取得 */
        _contents.insertAdjacentHTML("afterbegin", _html); /* 指定箇所に挿入 */

        /* 非同期を含まない(同期処理)pagenation */
        const _pagenation = document.querySelector('.pagenation'); /* 要素を挿入する元の要素を取得 */
        const _pagenationButton = _pagenation.querySelectorAll('.pageButton'); /* 子要素のボタンを全て取得 */
        const _changePage = (delta) => { /* addEvent～ではアロー関数しか使えないので適切に書いてある。 */
            return () => {
                numNow += delta; /* 現在のページと差を定義して */
                sessionStorage.setItem("now", numNow); /* セッションストレージにセット */
                window.location.href = 'all-article.html'; /* ページ遷移 */
            };
        };
        _pagenationButton[0].addEventListener('click', _changePage(-1)); /* 最初のボタンには前に戻る操作を */
        _pagenationButton[_pagenationButton.length - 1].addEventListener('click', _changePage(1)); /* 最後ボタンには次に行く操作を */
        async function _loadData () {

            /* データ表示 */
            const _apiUrl = 'https://script.google.com/macros/s/AKfycbwr2_yBunIZqw2theL2eHCCs65-DvJ3QmNEoT0na5gHALdjlq3JE_RuC2ZLlVulLTqlTg/exec';  /* GoogleスプレッドシートのAPIキー */
            const _articleList = _contents.querySelector('.article-list'); /* 要素を入れ込む要素を取得 */
            const _baseList = _contents.querySelector('.table-link'); /* これから作る要素のベース */
            const response = await fetch(_apiUrl); /* apiのURLからデータを取得 */
            const data = await response.json(); /* json形式に変更 */
            const max = 3; /* ページに表示させるMax */
            const pageNum = Math.ceil(data.length/max); /* 全ページ数を計算 */
            if (numNow>pageNum){ 
                numNow = pageNum; /* 最終ページよりも大きかったら最終ページにsル。 */
            };
            for (let i = max*(numNow-1); i <= max*(numNow)-1 ; i++){
                if(i <=data.length-1){
                    entry = data[i];
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
        await _loadData();

        /* 最後にベースを削除 */
        const _base = _contents.querySelector('.js-base');
        if (_base) {
            _base.parentNode.removeChild(_base);
        };
    } catch (error) { /* errorでエラーを受け取る */
        console.error("Error occurred while including content: ", error); /* コンソールに出力 */
    }
}

includerAll("all-article-content.html","main-content"); /* 実行 */