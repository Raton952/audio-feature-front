import { Component, OnInit } from '@angular/core';
import {ActivatedRoute} from "@angular/router";
import { Socket } from "ngx-socket-io";
import Peer from 'peerjs';
import { v4 as uuidv4 }  from 'uuid';
import * as io from 'socket.io-client';


 
interface VideoElement {
  muted: boolean;
  srcObject: MediaStream;
  userId: string;
}

@Component({
  selector: 'app-room',
  templateUrl: './room.component.html',
  styleUrls: ['./room.component.css']
})
export class RoomComponent implements OnInit {

  currentUserId:string = uuidv4();
  videos: VideoElement[] = [];
  isMute:boolean=true
  isVideoOn:boolean=true

  myPeer:any = new Peer(this.currentUserId, {
    host: '/',
    port: 3001,
  });
  localStream:any
  currentPeer:any
  user:any
  
  constructor(
    private route: ActivatedRoute,
    private socket: Socket,
  ) { 

   this.socket.ioSocket
  }
 
  ngOnInit() {
    // console.log(`Initialize Peer with id ${this.currentUserId}`);
    this.videoStream()

    this.socket.on('user-disconnected', (userId: string) => {
      console.log(userId);
      
      console.log(`receiving user-disconnected event from ${userId}`)
      this.videos = this.videos.filter(video => video.userId !== userId);
    });

    console.log( this.videos);
    
  }

  videoStream(){
      
    this.route.params.subscribe((params:any) => {
      console.log(params);
 
      this.myPeer.on('open', (userId: any) => {
        console.log(userId);
        this.user = userId
        this.socket.emit('join-room', params.roomId, userId);
      });
    });

    navigator.mediaDevices.getUserMedia({
      audio: true,
      video: this.isVideoOn,
    })
      .catch((err) => {
        console.error('[Error] Not able to retrieve user media:', err);
        return null;
      })
      .then((stream: MediaStream | any) => {
        // console.log(stream);
        this.localStream = stream
        // const calls = this.myPeer.call(this.currentUserId,stream)
        if (stream) {
          this.addMyVideo(stream);
        }
        // console.log(myPeer);
        
        this.myPeer.on('call', (call:any ) => {

          console.log('receiving call...', call);
          call.answer(stream);
 
          call.on('stream', (otherUserVideoStream: MediaStream) => {
            console.log('receiving other stream', otherUserVideoStream);
            this.addOtherUserVideo(call?.metadata?.userId, otherUserVideoStream);
            // this.currentPeer = calls.peerConnection
          });
 
          call.on('error', (err:any) => {
            console.error(err);
          })
        });
 
        this.socket.on('user-connected', (userId: string) => {
          console.log('Receiving user-connected event', `Calling ${userId}`);
 
          // Let some time for new peers to be able to answer
          
          setTimeout(() => {
            const call = this.myPeer.call(userId, stream, {
              metadata: { userId: this.currentUserId },
            });
            this.currentPeer = call.peerConnection
            call.on('stream', (otherUserVideoStream: MediaStream) => {
              console.log('receiving other user stream after his connection');
              this.addOtherUserVideo(userId, otherUserVideoStream);
            });
 
            call.on('close', () => {
              this.videos = this.videos.filter((video) => video.userId !== userId);
            });
          }, 1000);
        });
      });
  }

  muteAudio(){
      this.isMute = !this.isMute
      this.localStream.getAudioTracks()[0].enabled =  this.isMute
  }
  offVideo(){
    this.isVideoOn = !this.isVideoOn
    this.localStream.getVideoTracks()[0].enabled =  this.isVideoOn
  }
 
  addMyVideo(stream: MediaStream) {
    this.videos.push({
      muted: true,
      srcObject: stream,
      userId: this.currentUserId,
    });
  }
 
  addOtherUserVideo(userId: string, stream: MediaStream) {
    const alreadyExisting = this.videos.some(video => video.userId === userId);
    if (alreadyExisting) {
      console.log(this.videos, userId);
      return;
    }
    this.videos.push({
      muted: false,
      srcObject: stream,
      userId,
    });
  }
 
  onLoadedMetadata(event: Event) {
    console.log(event);
    
    (event.target as HTMLVideoElement).play();
  }

   shareScreen() {
    // @ts-ignore
    navigator.mediaDevices.getDisplayMedia({
      video: true,
      audio: {
        echoCancellation: true,
        noiseSuppression: true
      }
    }).then(stream => {
      const videoTrack = stream.getVideoTracks()[0];
      videoTrack.onended = () => {
        this.stopScreenShare();
      };

      const sender = this.currentPeer.getSenders().find((s:any) => s.track.kind === videoTrack.kind);
      sender.replaceTrack(videoTrack);
    }).catch(err => {
      console.log('Unable to get display media ' + err);
    });
  }

   stopScreenShare() {
    console.log(this.localStream);
    
    const videoTrack = this.localStream.getVideoTracks()[0];

    const sender = this.currentPeer.getSenders().find((s:any) => s.track.kind === videoTrack.kind);
    sender.replaceTrack(videoTrack);
  }
 

}
