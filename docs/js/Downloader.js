const Downloader = {

    run(files, fileName, callback) {

        let zip = new JSZip();

        for(let file of files) {
            zip.file(file.name, file.content, {base64: !!file.base64});
        }

        let ext = fileName.split(".").pop();
        if(ext !== "zip") fileName = fileName + ".zip";

        zip.generateAsync({type:"blob"}).then((content) => {
            window.saveAs(content, fileName);
            (typeof callback == 'function') && callback();
        });
    }

}