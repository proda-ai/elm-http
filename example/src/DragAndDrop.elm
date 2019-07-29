module Main exposing (Model, Msg(..), dropDecoder, hijackOn, init, main, subscriptions, update, view)

import Compat.Json.Decode as D
import File exposing (File)
import File.Select as Select
import Html exposing (..)
import Html.Attributes exposing (..)
import Html.Events exposing (..)
import Http
import Json.Decode as D



-- MAIN


main =
    Html.program
        { init = init
        , view = view
        , update = update
        , subscriptions = subscriptions
        }



-- MODEL


type alias Model =
    { hover : Bool
    , files : List File
    }


init : ( Model, Cmd Msg )
init =
    ( Model False [], Cmd.none )



-- UPDATE


type Msg
    = Pick
    | DragEnter
    | DragLeave
    | GotFiles File (List File)
    | GotValue D.Value
    | NoOp (Result Http.Error ())


update : Msg -> Model -> ( Model, Cmd Msg )
update msg model =
    case msg of
        Pick ->
            ( model
            , Select.files [ "image/*" ] GotFiles
            )

        GotValue v ->
            let
                _ =
                    Debug.log "<value: " v
            in
            ( model
            , Cmd.none
            )

        DragEnter ->
            ( { model | hover = True }
            , Cmd.none
            )

        DragLeave ->
            ( { model | hover = False }
            , Cmd.none
            )

        GotFiles file files ->
            ( { model
                | files = file :: files
                , hover = False
              }
            , Http.post
                { url = "http://localhost:8080"
                , body =
                    Http.multipartBody
                        (List.map (Http.filePart "file") (file :: files)
                            ++ [ Http.stringPart "aw ssu" "asdf" ]
                        )
                , expect = Http.expectWhatever NoOp
                }
            )

        NoOp e ->
            let
                _ =
                    Debug.log "whatever" e
            in
            ( model, Cmd.none )



-- SUBSCRIPTIONS


subscriptions : Model -> Sub Msg
subscriptions model =
    Sub.none



-- VIEW


view : Model -> Html Msg
view model =
    div
        [ style
            [ ( "border"
              , if model.hover then
                    "6px dashed purple"

                else
                    "6px dashed #ccc"
              )
            ]
        , style
            [ ( "border-radius", "20px" )
            , ( "width", "480px" )
            , ( "height", "100px" )
            , ( "margin", "100px auto" )
            , ( "padding", "20px" )
            , ( "display", "flex" )
            , ( "flex-direction", "column" )
            , ( "justify-content", "center" )
            , ( "align-items", "center" )
            ]
        , hijackOn "dragenter" (D.succeed DragEnter)
        , hijackOn "dragover" (D.succeed DragEnter)
        , hijackOn "dragleave" (D.succeed DragLeave)
        , hijackOn "drop" dropDecoder
        ]
        [ button [ onClick Pick ] [ text "Upload Images" ]
        , span [ style [ ( "color", "#ccc" ) ] ] [ text (toString model) ]
        ]


dropDecoder : D.Decoder Msg
dropDecoder =
    D.at [ "dataTransfer", "files" ] (D.oneOrMore GotFiles File.decoder)


hijackOn : String -> D.Decoder msg -> Attribute msg
hijackOn event decoder =
    onWithOptions event { preventDefault = True, stopPropagation = False } decoder
