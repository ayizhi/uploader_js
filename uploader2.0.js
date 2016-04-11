/**
 * Created by zhangyizhi on 16/3/30.
 */


//一个上传框架,针对业务,需要用到百度的webuploader与jq


//var theInfo = {
//    '_csrf':'',
//    'size':'',
//    'style':'0',//0:没有预览但能下载,1:没有预览,不能下载,2:有预览有名字(能下载),3:有预览没名字(不能下载)
//}

//div格式
//  <div class="uploader">
//      <div class="uploadAlready">
//          <!-- image url -->
//          <?php if ($company['logo']) {?>
//              <div class="clearfix" class="previewBox">
//                  <div class="prevImgBox">
//                      <img class="uploadPreview" src="<?= Html::encode($company['logo_url'], false) ?>">
//                      <a href = "<?=$company['licence_url']?>"><?=$company['business_licence_filename']?></a>
//                  </div>
//              </div>
//          <?php }?>
//      </div>
//      <a href="javascript:;"  class = "fileupload-btn" id = 'logoUploaderBtn'>上传logo</a>
//      <span class="img-remind">图片格式为JPG、JPEG、PNG，大小在100K内，建议尺寸200px*30px以内</span>
//      <input type="hidden" class="file-path" name="logo" value="<?= Html::encode($company['logo'], false)?>">
//      <input type="hidden" class="file-name" name="logo" value="<?= Html::encode($company['logo'], false)?>">

//  </div>

//上传文件
function uploaderFunc(dom,type,theInfo){//type可不传,默认为type == 0.也就是图片; theInfo{'_csrf':'','size':'','download':'true/false','preview':'true/false'}
    if(!WebUploader.Uploader.support()){return};

    var arg = arguments,
        dom,
        type,
        theInfo,
        argLen = arg.length;
    if(argLen == 2){//若为2,则没传type,默认type为0,也就是图片
        dom = arg[0];
        type = 0;
        theInfo = arg[1];
    }else if(argLen == 3){
        dom = arg[0];
        type = arg[1];
        theInfo = arg[2];
    }else{
        alert('您输入的参数数量有问题')
    }


    var uploader = WebUploader.create({
        swf: '../plugins/webUploader/Uploader.swf',
        server: '/site/ajax-upload-file.html',
        pick: dom,//类似jq选择器
        resize: false,
        compress: false,
        accept: {
            title : type == 0 ? 'Images' : 'Docs',
        }
    });

    var $alreadyBox = $(dom).siblings('.uploadAlready');
    var $filePath = $(dom).siblings('.file-path');
    var $fileName = $(dom).siblings('.file-name');

    uploader.options.formData.limit = 0

    for(var i in theInfo){
        uploader.options.formData[i] = theInfo[i];
    }


    // 当有文件被添加进队列的时候
    uploader.on( 'fileQueued', function( file ) {
        var fileName = file.name;
        var lastDot = fileName.lastIndexOf(".");
        var typeName = fileName.slice(lastDot+1).toLowerCase();
        var fileSize = file.size;


        //判断格式
        if(type == 0){
            var regArr = ['doc','docx','pdf','zip','rar'];
        }else if(type == 1){
            var regArr = ['gif','jpg','jpeg','bmp','png'];
        }
        if(regArr.indexOf(typeName) == -1){
            $alreadyBox.html('<span class = "error">上传文件格式必须是' + regArr.join('/') + '</span>')
            uploader.reset();
            return;
        }


        //判断大小
        var theSize = theInfo['size'] ? theInfo['size'] : 2*1024*1024
        if(fileSize > theSize){
            var sologan = theInfo['size'] ? '上传logo大小必须在'+ theInfo['size']/1024 +'K以内' : '上传logo大小必须在2MB以内'
            $alreadyBox.html('<span class = "error">' + sologan + '</span>');
            uploader.reset();
            return;
        }

        $alreadyBox.html('<p><img src="/img/uploading.gif" /> </p>');
        uploader.upload()

    });

    uploader.on( 'uploadSuccess', function( file, response ) {

        if(response.status){
            var style = theInfo['style'] ? theInfo['style'] : 0

            if(style == 0){
                $alreadyBox.html(
                    '<a href = "' + JSON.parse(response._raw).data.url + '">' + file.name + '</a>'
                )
            }else if(style == 1){
                $alreadyBox.html(
                    '<span>' + file.name + '</span>'
                )

            }else if(style == 2){
                $alreadyBox.html([
                    '<div class="clearfix" class="previewBox">',
                    '<div class="prevImgBox">',
                    '<img class="uploadPreview" src= "' + JSON.parse(response._raw).data.url + '">',
                    '<a href = "' + JSON.parse(response._raw).data.url + '">' + file.name + '</a>',
                    '</div>',
                    '</div>'].join("")
                )
            }else if(style ==  3){
                $alreadyBox.html([
                    '<div class="clearfix" class="previewBox">',
                    '<div class="prevImgBox">',
                    '<img class="uploadPreview" src="' + JSON.parse(response._raw).data.url + '">',
                    '</div>',
                    '</div>'].join('')
                )
            }



            var filePath = JSON.parse(response._raw).data.path;
            var fileName = file.name;
            if($fileName){
                $fileName.val(fileName);
            }
            if($filePath){
                $filePath.val(filePath);
            }

            //重置
            uploader.reset();

        } else {
            var message = ''
            if(response.message){
                message = response.message;
            }else{
                message = '上传失败,请重试'
            }
            $alreadyBox.html('<span class = "error">' + message + '</span>')

            //重置
            uploader.reset();
        }
    });

    uploader.on( 'uploadError', function( file,response ) {
        $alreadyBox.html('<span class = "error">上传失败,请重试</span>')

        //重置
        uploader.reset();
    });

}