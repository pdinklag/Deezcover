<?
    $id = $_GET['id'];
    echo(file_get_contents("http://api.deezer.com/track/$id"));
?>