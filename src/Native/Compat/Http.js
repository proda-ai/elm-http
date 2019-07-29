/*

Dict  =>  _elm_lang$core$Dict$
import Dict exposing (empty, update)
Scheduler  =>  _elm_lang$core$Native_Scheduler.
import Elm.Kernel.Scheduler exposing (binding, fail, rawSpawn, succeed)
Utils  =>  _elm_lang$core$Native_Utils.
import Elm.Kernel.Utils exposing (Tuple2)
Http  =>  _proda_ai$elm_http$Compat_Http$
import Http exposing (BadUrl_, Timeout_, NetworkError_, BadStatus_, GoodStatus_, Sending, Receiving)
Maybe  =>  _elm_lang$core$Maybe$
import Maybe exposing (Just, Nothing, isJust)
Platform  =>  _elm_lang$core$Platform$
import Platform exposing (sendToApp, sendToSelf)
Result  =>  _elm_lang$core$Result$
import Result exposing (map, isOk)

*/


// SEND REQUEST

var _proda_ai$elm_http$Native_Compat_Http = function() {

    function isJust(v) {
        return v.ctor === 'Just';
    }

    var toTask = F3(function(router, toTask, request)
    {
        console.log(request);
        return _elm_lang$core$Native_Scheduler.nativeBinding(function(callback)
        {
            function done(response) {
                callback(toTask(request.expect.toValue(response)));
            }

            var xhr = new XMLHttpRequest();
            xhr.addEventListener('error', function() { done(_proda_ai$elm_http$Compat_Http$NetworkError_); });
            xhr.addEventListener('timeout', function() { done(_proda_ai$elm_http$Compat_Http$Timeout_); });
            xhr.addEventListener('load', function() { done(toResponse(request.expect.toBody, xhr)); });
            console.log(request.tracker);
            isJust(request.tracker) && track(router, xhr, request.tracker._0);

            try {
                xhr.open(request.method, request.url, true);
            } catch (e) {
                return done(_proda_ai$elm_http$Compat_Http$BadUrl_(request.url));
            }

            configureRequest(xhr, request);

            console.log(request.body)

            request.body._0 && xhr.setRequestHeader('Content-Type', request.body._0);
            xhr.send(request.body._1);

            return function() { xhr.__isAborted = true; xhr.abort(); };
        });
    });


    // CONFIGURE

    function configureRequest(xhr, request)
    {
        for (var headers = request.headers; headers._1; headers = headers._1) // WHILE_CONS
        {
            xhr.setRequestHeader(headers._0._0, headers._0._1);
        }
        xhr.timeout = request.timeout._0 || 0;
        xhr.responseType = request.expect.type;
        xhr.withCredentials = request.allowCookiesFromOtherDomains;
    }


    // RESPONSES

    function toResponse(toBody, xhr)
    {
        return A2(
            200 <= xhr.status && xhr.status < 300 ? _proda_ai$elm_http$Compat_Http$GoodStatus_ : _proda_ai$elm_http$Compat_Http$BadStatus_,
            toMetadata(xhr),
            toBody(xhr.response)
        );
    }


    // METADATA

    function toMetadata(xhr)
    {
        return {
            url: xhr.responseURL,
            statusCode: xhr.status,
            statusText: xhr.statusText,
            headers: parseHeaders(xhr.getAllResponseHeaders())
        };
    }


    // HEADERS

    function parseHeaders(rawHeaders)
    {
        if (!rawHeaders)
        {
            return _elm_lang$core$Dict$empty;
        }

        var headers = _elm_lang$core$Dict$empty;
        var headerPairs = rawHeaders.split('\r\n');
        for (var i = headerPairs.length; i--; )
        {
            var headerPair = headerPairs[i];
            var index = headerPair.indexOf(': ');
            if (index > 0)
            {
                var key = headerPair.substring(0, index);
                var value = headerPair.substring(index + 2);

                headers = A3(_elm_lang$core$Dict$update, key, function(oldValue) {
                    return _elm_lang$core$Maybe$Just(isJust(oldValue)
                        ? value + ', ' + oldValue._0
                        : value
                    );
                }, headers);
            }
        }
        return headers;
    }


    // EXPECT

    var expect = F3(function(type, toBody, toValue)
    {
        return {
            type: type,
            toBody: toBody,
            toValue: toValue
        };
    });

    var mapExpect = F2(function(func, expect)
    {
        return {
            type: expect.type,
            toBody: expect.toBody,
            toValue: function(x) { return func(expect.toValue(x)); }
        };
    });

    function toDataView(arrayBuffer)
    {
        return new DataView(arrayBuffer);
    }


    // BODY and PARTS

    var emptyBody = { };
    var pair = F2(_elm_lang$core$Native_Utils.Tuple2);

    function toFormData(parts)
    {
        for (var formData = new FormData(); parts._1; parts = parts._1) // WHILE_CONS
        {
            var part = parts._0;
            formData.append(part._0, part._1);
        }

        for (var value of formData.values()) {
            console.log('value',value);
        }
        return formData;
    }

    var bytesToBlob = F2(function(mime, bytes)
    {
        return new Blob([bytes], { type: mime });
    });


    // PROGRESS

    function track(router, xhr, tracker)
    {
        // TODO check out lengthComputable on loadstart event

        xhr.upload.addEventListener('progress', function(event) {
            if (xhr.__isAborted) { return; }
            _elm_lang$core$Native_Scheduler.rawSpawn(A2(_elm_lang$core$Platform$sendToSelf, router, _elm_lang$core$Native_Utils.Tuple2(tracker, _proda_ai$elm_http$Compat_Http$Sending({
                sent: event.loaded,
                size: event.total
            }))));
        });
        xhr.addEventListener('progress', function(event) {
            if (xhr.__isAborted) { return; }
            _elm_lang$core$Native_Scheduler.rawSpawn(A2(_elm_lang$core$Platform$sendToSelf, router, _elm_lang$core$Native_Utils.Tuple2(tracker, _proda_ai$elm_http$Compat_Http$Receiving({
                received: event.loaded,
                size: event.lengthComputable ? _elm_lang$core$Maybe$Just(event.total) : _elm_lang$core$Maybe$Nothing
            }))));
        });
    }

     return {
         parseHeaders: parseHeaders,
         toDataView: toDataView,
         toResponse: toResponse,
         bytesToBlob: bytesToBlob,
         expect: expect,
         toTask: toTask,
         pair: pair,
         emptyBody: emptyBody,
         mapExpect: mapExpect,
         configureRequest: configureRequest,
         toFormData: toFormData,
         track: track,
         toMetadata: toMetadata
    }
}();
