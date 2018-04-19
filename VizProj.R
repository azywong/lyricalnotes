install.packages("rjson")
library("rjson")
library(stringr)
library(magrittr)
library(lubridate)

# ---------------------------------------------------------------
# read lyric files

setwd("~/")
setwd("Desktop/")
billboard <- read.csv("DATA/masterBillboard.csv", header = T)
billboard <- billboard[,-c(1,3)]

# test <- fromJSON(file="26760-lyrics.json")

lyrics <- test$lyrics %>%
  str_replace_all("[\n]" , " ") %>% # replace new lines
  str_replace_all(",", "") %>% # remove commas
  str_replace_all("'", "") %>% # remove apostrophes
  str_replace_all("  ", " ") %>% # remove double spaces
  tolower() # to lowercase

lyrics.df <- unlist(strsplit(lyrics, " ")) %>%
  table() %>%
  as.data.frame()

setwd("lyrics")
files <- Sys.glob("*.json") # get files with same extension

df <- as.character(data.frame()) # data frame for all longs
for (f in 1:length(files)) { # loop through each file
  song <- fromJSON(file = files[f])
  file <- str_replace_all(files[f], ".json", "") # remove extension and get file
  print(f) # check for progress
  song.vect <- c(song$song_id, song$song_name, song$display_artist, song$lyrics)
  df <- rbind(df, song.vect)
}
colnames(df) <- c("song_id", "song_Name", "artist", "lyrics") # set column names
rownames(df) <- NULL # get rid of row names
df <- as.data.frame(df) # coerce to dataframe

write.csv(df, "masterLyrics.csv") # write data frame to csv

# ---------------------------------------------------------------
# read billboard files

# testing
# test <- fromJSON(file="1990-1-6.json")
# test$songs[[1]]$rank
# test$songs[[1]]$song_name
# test$songs[[1]]$display_artist
# 
# df <- as.character(data.frame()) # empty row
# for (i in 1:length(test$songs)) {
#   song <- test$songs[[i]]
#   vect <- c(song$rank, song$song_name, song$display_artist)
#   df <- rbind(df, vect)
# }
# colnames(df) <- c("Rank", "Song Name", "Artist")

setwd("Billboard 1990 - 2015/") # set wd
files <- Sys.glob("*.json") # get files with same extension

df <- as.character(data.frame()) # data frame for all longs
for (f in 1:length(files)) { # loop through each file
  obj <- fromJSON(file = files[f])
  date <- str_replace_all(files[f], ".json", "") # remove extension and get date
  print(date) # check for progress
  songs <- obj$songs
  if (length(songs) == 0) {
    print(paste("ERROR: ", date))
  }
  else {
    for (i in 1:length(songs)) { # loop through songs in each list
      if (length(songs) != 100) { # check which length not 100
        # print(paste("NOT 100 SONGS: ", date))
      }
      song <- songs[[i]]
      song.vect <- c(date, song$rank, song$song_id, song$song_name, song$display_artist)
      df <- rbind(df, song.vect)
    }
  }
}
colnames(df) <- c("Date", "Rank", "Song_id", "Song_Name", "Artist") # set column names
rownames(df) <- NULL # get rid of row names
df <- as.data.frame(df) # coerce to dataframe

df$Date <- as.Date(df$Date, "%Y-%m-%d")
df <- df[order(as.Date(df$Date, format = "%Y-%m-%d")),] # order by date
write.csv(df, "masterBillboard.csv") # write data frame to csv

# song.name.table <- as.data.frame(table(df$`Song Name`))
artist.table <- as.data.frame(table(df$Artist))
colnames(artist.table) <- c("Artist", "Freq")
artist.table <- artist.table[order(-artist.table$Freq),] # order by frequency
top5.artists <- as.vector(artist.table$Artist[1:5]) # top 5 artists
top5.artists.df <- subset(df, df$Artist == top5.artists)

viz1 <- as.character(data.frame(1))
for (i in 1:5) {
  temp.df <- subset(df, df$Artist == top5.artists[i])
  temp.df <- temp.df[,-2] # remove rank column
  temp.df <- as.data.frame(table(temp.df$Date)) # table of date frequencies
  colnames(temp.df) <- c("Date", "Freq")
  temp.df <- temp.df[order(as.Date(temp.df$Date, format = "%Y-%m-%d")),] 
  count <- 0
  count.vect <- c()
  for (j in 1:nrow(temp.df)) { # get cumulative count
    count <- count + temp.df$Freq[j]
    count.vect <- c(count.vect, count)
  }
  temp.df <- cbind(temp.df, count.vect)
  temp.df <- temp.df[,-2]
  viz1 <- cbind(viz1, temp.df) # bind to data frame
}

viz1 <- viz1[,-c(1,4,6,8,10)] # remove columns
colnames(viz1) <- c("Date", top5.artists) # rename columns
write.csv(viz1, "viz1Artists.csv")

# get yearly data
viz1_2 <- read.csv("viz1Artists1.csv")
num <- 1
idx <- c()
for (i in 1:27) {
  idx <- c(idx, num)
  num <- num + 52
}
# idx <- idx[-which(idx > 1353)] # reduce values
new.df <- viz1_2[c(idx),]
write.csv(new.df, "viz1ArtistsYearly.csv")

# ---------------------------------------------------------------
# combine datasets
setwd("~/")
setwd("Desktop/DATA/")

bb <- read.csv(file = "masterBillboard.csv")
bb <- bb[,-c(1,3)] # remove irrelevant cols

lyric <- read.csv(file = "masterLyrics.csv")
lyric <- lyric[,-1] # remove irrelevant cols

# get years
dates <- bb$Date
year.vect <- c()
for (i in 1:length(dates)) {
  year <- format(as.Date(dates[i], format="%Y-%m-%d"),"%Y")
  year.vect <- c(year.vect, year)
}
bb <- cbind(bb, year.vect)
colnames(bb)[5] <- "year"

# get unique song_id from billboard and lyrics
bb.songs <- unique(bb$Song_id)
lyric.ids <- unique(lyric$song_id)

temp.vect <- rep(0, nrow(bb))
bb <- cbind(bb, temp.vect)

for (i in 1:length(lyric.ids)) { # input columns with lyrics
  print(i)
  bb.idx <- which(bb$Song_id == lyric.ids[i]) # which bb indices same have song_id as bb.songs[i]
  lyric.idx <- which(lyric$song_id == lyric.ids[i]) # which lyric indices same have song_id as bb.songs[i]
  target.lyrics <- as.character(lyric$lyrics[lyric.idx]) # get lyrics
  if (target.lyrics != 0) { # if target.lyrics not empty
    bb$temp.vect[bb.idx] = target.lyrics
  }
  else
    print("here")
}

df <- data.frame()
df <- as.data.frame(cbind(as.character(bb$year), bb$Song_id, as.character(bb$Song_Name), as.character(bb$Artist), bb$temp.vect))
colnames(df) <- c("year", "song_id", "song_name", "artist", "lyrics")

write.csv(df, "data_partial_lyrics.csv")
write.csv(bb, "billboard_with_lyrics.csv") #******MASTER

# ---------------------------------------------------------------
# vocab viz
dat <- bb
missing.lyrics <- which(dat$temp.vect == 0)
dat <- dat[-c(missing.lyrics),] # get rid of rows with missing lyrics
app.freq <- as.data.frame(table(dat$Song_id)) # table of freq of each song

app.freq <- app.freq[order(-app.freq$Freq),] # order by date
top.apps <- app.freq[c(1:200),]
colnames(top.apps) <- c("song_id", "freq")

most.freq.songs <- as.character(data.frame())
for (i in 1:nrow(top.apps)) {
  id <- top.apps$song_id[i]
  song <- which(lyric$song_id == id)
  row <- lyric[song,]
  most.freq.songs <- rbind(most.freq.songs, row)
}

most.freq.songs <- cbind(most.freq.songs, top.apps$freq) # df of top 200 most freq songs 

first.date <- c()
vocab <- c()
for (i in 1:nrow(most.freq.songs)) {
  # clean up lyrics
  lyrics <- as.character(most.freq.songs$lyrics[i]) %>%
    str_replace_all("[\n]" , " ") %>% # replace new lines
    str_replace_all(",", "") %>% # remove commas
    str_replace_all("'", "") %>% # remove apostrophes
    str_replace_all("  ", " ") %>% # remove double spaces
    str_replace_all("[[:punct:]]", "")  %>%
    tolower() # to lowercase
  
  #list words
  lyrics.df <- unlist(strsplit(lyrics, " ")) %>%
    table() %>%
    as.data.frame()
  
  # vocab
  v <- nrow(lyrics.df) 
  vocab <- c(vocab, v)
  
  # get first date of appearances and append to data frame
  id <- most.freq.songs$song_id[i]
  dat.idx <- which(dat$Song_id == id)
  tar <- dat.idx[1] # first entry index
  date <- as.character(as.Date(dat$Date[tar], format = "%Y-%m-%d"))
  first.date <- c(first.date, date)
}

most.freq.songs <- cbind(most.freq.songs, vocab, first.date)

colnames(most.freq.songs) <- c("song_id", "song_name", "artist", "lyrics", "num_apps", "vocab", "first_app")

write.csv(most.freq.songs, "viz2.csv")







