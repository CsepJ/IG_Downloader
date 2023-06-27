let axios = require("axios").default;
let path = require("path");
let fs = require("fs");
let url = require("url");
//enter ig feed link
let link = "https://www.instagram.com/p/CsgArnBO2Mp";
let target_url = url.resolve(link, "?__a=1&__d=dis");
//img/video save dir name
let saveDir = "data";
let downloadWithThumbnail = true;
axios.get(target_url, {
    timeout: 10000
})
.then(r => {
    let target_path = `./${saveDir}/${r.data.graphql.shortcode_media.shortcode}/`;
    (!fs.existsSync(`./${saveDir}/`))&&fs.mkdirSync(`./${saveDir}`);
    (!fs.existsSync(target_path))&&fs.mkdirSync(target_path);
    let contents = r.data.graphql.shortcode_media.edge_sidecar_to_children.edges;
    for(let i=0;i<contents.length;i++) {
        let isVideo = contents[i].node.is_video;
        if(isVideo){
            if(downloadWithThumbnail){
                let video = contents[i].node.video_url;
                let file_path = path.join(target_path, `${contents[i].node.shortcode}/`);
                (!fs.existsSync(file_path))&&fs.mkdirSync(file_path);
                let thumbnails = contents[i].node.display_resources;
                let thumbnail = thumbnails[thumbnails.length - 1].src;
                axios.get(thumbnail, {
                    responseType: "stream",
                    timeout: 10000,
                    headers: {
                        "Content-Type": "image/png"
                    }
                }).then(r => {
                    let fileName = path.join(file_path, `thumbnail-${contents[i].node.shortcode}.png`);
                    let file = fs.createWriteStream(fileName);
                    r.data.pipe(file);
                });
                axios.get(video, {
                    responseType: "stream",
                    timeout: 10000,
                    headers: {
                        "Content-Type": "video/mp4"
                    }
                }).then(r => {
                    let fileName = path.join(file_path, `${contents[i].node.shortcode}.mp4`);
                    let file = fs.createWriteStream(fileName);
                    r.data.pipe(file);
                })
            }else{
                let video = contents[i].node.video_url;
                axios.get(video, {
                    responseType: "stream",
                    timeout: 10000,
                    headers: {
                        "Content-Type": "video/mp4"
                    }
                }).then(r => {
                    let fileName = path.join(target_path, `${contents[i].node.shortcode}.mp4`);
                    let file = fs.createWriteStream(fileName);
                    r.data.pipe(file);
                })
            }
        }else{
            let img = contents[i].node.display_resources;
            axios.get(img[img.length - 1].src, {
                responseType: "stream",
                headers: {
                    "Content-Type": "image/png"
                }
            }).then(r => {
                let fileName = path.join(target_path,`${contents[i].node.shortcode}.png`);
                let file = fs.createWriteStream(fileName);
                r.data.pipe(file);
            })
        }
    }
});