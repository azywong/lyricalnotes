library("rjson")
library(stringr)
library(magrittr)
library(lubridate)
library(plyr)

# ---------------------------------------------------------------
# read lyric files

setwd("~/")
setwd("Desktop/")
billboard <- read.csv("DATA/masterBillboard.csv", header = T)
billboard <- billboard[,-c(1,3)]

test <- fromJSON(file="12059-lyrics.json")

lyrics <- test$lyrics %>%
  str_replace_all("[\n]" , " ") %>% # replace new lines
  str_replace_all(",", "") %>% # remove commas
  str_replace_all("'", "") %>% # remove apostrophes
  str_replace_all("  ", " ") %>% # remove double spaces
  tolower() # to lowercase

lyrics.df <- unlist(strsplit(lyrics, " ")) %>%
  table() %>%
  as.data.frame()

setwd("Desktop/Final Project/missing/")
files <- Sys.glob("*.json") # get files with same extension

df <- as.character(data.frame()) # data frame for all longs
for (f in 1:length(files)) { # loop through each file
  song <- fromJSON(file = files[f])
  file <- str_replace_all(files[f], ".json", "") # remove extension and get file
  print(f) # check for progress
  if (is.null(test$song_id)) {
    id <- str_replace_all(file, "-lyrics", "")
  }
  else{
    id <- song$song_id
  }
  song.vect <- c(id, song$song_name, song$display_artist, song$lyrics)
  df <- rbind(df, song.vect)
}
colnames(df) <- c("song_id", "song_Name", "artist", "lyrics") # set column names
rownames(df) <- NULL # get rid of row names
df <- as.data.frame(df) # coerce to dataframe

write.csv(df, "missingLyrics1.csv") # write data frame to csv

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
setwd("Final Project/")

bb <- read.csv(file = "DATA/masterBillboard.csv")
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
dat <- bb.lyrics
missing.lyrics <- which(dat$temp.vect == 0)
dat <- dat[-c(missing.lyrics),] # get rid of rows with missing lyrics
app.freq <- as.data.frame(table(dat$Song_id)) # table of freq of each song

# make table of top x songs
app.freq <- app.freq[order(-app.freq$Freq),] # order by date
top.apps <- app.freq[c(1:500),] # top 500
colnames(top.apps) <- c("song_id", "freq")

# get song entries of corresponding ids
most.freq.songs <- as.character(data.frame())
for (i in 1:nrow(top.apps)) {
  id <- top.apps$song_id[i]
  song <- which(bb.lyrics$Song_id == id)
  row <- bb.lyrics[song,]
  most.freq.songs <- rbind(most.freq.songs, row)
}

unique.ids <- unique(most.freq.songs$Song_id)

# get first entry of each song
first.entry.idx <- c()
j <- 1
for (i in 1:nrow(most.freq.songs)) {
  id.to.get <- as.integer(unique.ids[j])
  if (as.integer(most.freq.songs$Song_id[i]) == id.to.get) {
    first.entry.idx <- c(first.entry.idx, i)
    j <- j+1 # increment
  }
}
most.freq.songs <- most.freq.songs[c(first.entry.idx),] # subset to idx to first entries
most.freq.songs <- cbind(most.freq.songs, top.apps$freq) # df of top 500 most freq songs 
colnames(most.freq.songs) <- c("date", "song_id", "name", "artist", "year", "lyrics", "freq")
rownames(most.freq.songs) <- NULL

write.csv(most.freq.songs, "500MostFreqSongs.csv")

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
}

most.freq.songs <- cbind(most.freq.songs, vocab)

# colnames(most.freq.songs) <- c("song_id", "song_name", "artist", "lyrics", "num_apps", "vocab", "first_app")

write.csv(most.freq.songs, "viz2_v2.csv")

# -----------------------------------
viz1 <- read.csv("DATA/viz1ArtistsYearly.csv", header = T)
viz1.2 <- read.csv("DATA/viz1Artists1.csv", header = T)

swift.idx <- which(billboard$Artist == "Taylor Swift")
swift.df <- as.data.frame(billboard[c(swift.idx),])
swift.table <- as.data.frame(table(as.character(swift.df$Song_Name)))

chesney.idx <- which(billboard$Artist == "Kenny Chesney")
chesney.df <- as.data.frame(billboard[c(chesney.idx),])
chesney.table <- as.data.frame(table(as.character(chesney.df$Song_Name)))

mcgraw.idx <- which(billboard$Artist == "Tim McGraw")
mcgraw.df <- as.data.frame(billboard[c(mcgraw.idx),])
mcgraw.table <- as.data.frame(table(as.character(mcgraw.df$Song_Name)))

carey.idx <- which(billboard$Artist == "Mariah Carey")
carey.df <- as.data.frame(billboard[c(carey.idx),])
carey.table <- as.data.frame(table(as.character(carey.df$Song_Name)))

urban.idx <- which(billboard$Artist == "Keith Urban")
urban.df <- as.data.frame(billboard[c(urban.idx),])
urban.table <- as.data.frame(table(as.character(urban.df$Song_Name)))

# -----------------------------------
songs <- read.csv("Desktop/Final Project/DATA/billboard_with_lyrics.csv", header = T)
songs <- songs[,-1] # rid first column
songs$Date <- as.Date(songs$Date) # date objects

# get rid of no lyric rows
empty.idx <- which(songs$temp.vect == 0)
songs <- songs[-c(empty.idx),]

month.vect <- c()
for (i in 1:nrow(songs)) {
  print(i)
  month <- format(songs$Date[i], "%b")
  month.vect <- c(month.vect, month)
}
songs <- cbind(songs, month.vect) # append to df 

# write.csv(songs, "songswLyricsYearMonth2.csv")
##### songs has been saved as songswLyricsYearMonth.csv
# songs <- read.csv("Desktop/DATA/songswLyricsYearMonth.csv")

# target words
words <- c("love", "burn", "baby", "girl", "boy", "why", "truck", "happy", "sad")

### get viz3 word data by year

# get unique years
unique.years <- unique(songs$year)

all.years.df <- list()
for (i in 1:length(unique.years)) {
  print(unique.years[i])
  year.df <- data.frame()
  year.subset.idx <- which(songs$year == unique.years[i])
  year.subset <- songs[c(year.subset.idx),]
  for (j in 1:nrow(year.subset)) {
    lyrics <- as.character(year.subset$temp.vect[j]) %>%  # lyrics for song in subset
      str_replace_all("[\n]" , " ") %>% # replace new lines
      str_replace_all(",", "") %>% # remove commas
      str_replace_all("'", "") %>% # remove apostrophes
      str_replace_all("  ", " ") %>% # remove double spaces
      str_replace_all("[[:punct:]]", "")  %>%
      tolower() # to lowercase
    lyrics.df <- unlist(strsplit(lyrics, " ")) %>% #list words
      as.data.frame()
    year.df <- rbind(year.df, lyrics.df)
  }
  all.years.df[i] <- year.df
}

# get tables and form data frame
viz3 <- as.character(data.frame())
for (j in 1:length(all.years.df)) {
  year.all.words <- all.years.df[j]
  year.table <- as.data.frame(table(year.all.words))
  year.table$year.all.words <- as.character(year.table$year.all.words)
  for (i in 1:length(words)) {
    idx <- which(year.table$year.all.words == words[i])
    if (length(year.table$Freq[idx]) == 0) { # if value 0
      # print("here")
      temp.vect <- c(unique.years[j], words[i], "0")
    }
    else {
      temp.vect <- c(unique.years[j], words[i], year.table$Freq[idx])
    }
    # print(temp.vect)
    viz3 <- rbind(viz3, temp.vect)
  }
}
rownames(viz3) <- NULL # get rid of row names
colnames(viz3) <- c("year", "word", "count")
viz3 <- data.frame(viz3)
# write.csv(viz3, "viz3.csv") # write csv

# reshape dataframe
library(reshape2)
viz3.2 <- dcast(viz3, year ~ word, value.var = "count")

write.csv(viz3.2, "viz3_v2.csv") # write csv

# ---------------------------------------------------------------
# update master dataset with lyrics
bb.lyrics <- read.csv("Desktop/Final Project/DATA/billboard_with_lyrics.csv")
bb.lyrics <- bb.lyrics[,-1] # remove column of rows
lyrics <- read.csv("Desktop/Final Project/DATA/missingLyrics1.csv")
lyrics <- lyrics[,-1]

bb.lyrics$temp.vect <- as.character(bb.lyrics$temp.vect)
lyrics$lyrics <- as.character(lyrics$lyrics)

missing.idx <- which(bb.lyrics$temp.vect == 0) # indices of rows with missing lyrics
missing.ids <- bb.lyrics[missing.idx,]$Song_id %>% unique() %>% as.vector() # unique ids of songs with missing lyrics
lyric.ids <- lyrics$song_id %>% as.vector()
ids.to.add <- intersect(lyric.ids, missing.ids)

for (i in 1:length(ids.to.add)) {
  id <- ids.to.add[i]
  idx.lyrics <- which(lyrics$song_id == id)
  idx.to.impute <- as.vector(which(bb.lyrics$Song_id == id))
  bb.lyrics[idx.to.impute,]$temp.vect <- lyrics$lyrics[idx.lyrics]
}

# write.csv(bb.lyrics, "billboard_with_lyrics.csv")

# ---------------------------------------------------------------
# song ids still missing
bb.lyrics <- read.csv("DATA/billboard_with_lyrics.csv")
bb.lyrics <- bb.lyrics[,-1] # remove column of rows

missing.idx <- which(bb.lyrics$temp.vect == 0) # indices of rows with missing lyrics
missing.titles <- bb.lyrics[missing.idx,]$Song_Name %>% as.vector()
missing.artists <- bb.lyrics[missing.idx,]$Artist %>% as.vector()
missing.ids <- bb.lyrics[missing.idx,]$Song_id %>% as.vector()# unique ids of songs with missing lyrics
missing.df <- as.data.frame(cbind(missing.ids, missing.titles, missing.artists))
freq.table <- as.data.frame(count(missing.df, c('missing.ids', 'missing.titles', 'missing.artists'))) # get 3-way frequencies
colnames(freq.table) <- c("id", "title", "artist", "freq")
rownames(freq.table) <- NULL

# write.csv(freq.table, "missingFreq.csv")

# ---------------------------------------------------------------
# get individual word stats

# create data frame and get freq of each unique word
all.words <- data.frame()
for (i in 1:length(all.years.df)) {
  print(i)
  df <- as.data.frame(all.years.df[[i]])
  all.words <- rbind(all.words, df)
}
unique.words <- unique(all.words) # unique words
words.freq.table <- as.data.frame(table(all.words)) # frequency of each word

all.words.vect <- as.vector(unlist(unique.words))

### number of unique words: 46193
# create data frame of all words
# read data in
all.words.vect <- read.csv("Desktop/allWordsVect.csv")
all.words.vect <- as.vector(unlist(all.words.vect$x)) # convert to vector and unlist
unique.years <- c(1990:2015)

viz4 <- as.character(data.frame())  ### stopped at 2007, restart from 2007 to 2015
for (j in 18:length(all.years.df)) {
  print(j)
  year.all.words <- all.years.df[j]
  year.table <- as.data.frame(table(year.all.words))
  year.table$year.all.words <- as.character(year.table$year.all.words)
  for (i in 1:length(all.words.vect)) {
    # print(unique.years[j])
    idx <- which(year.table$year.all.words == all.words.vect[i])
    if (length(year.table$Freq[idx]) == 0) { # if value 0
      # print("here")
      temp.vect <- c(unique.years[j], all.words.vect[i], "0")
    }
    else {
      temp.vect <- c(unique.years[j], all.words.vect[i], year.table$Freq[idx])
    }
    viz4 <- rbind(viz4, temp.vect)
  }
}
rownames(viz4) <- NULL # get rid of row names
colnames(viz4) <- c("year", "word", "count")
viz4 <- data.frame(viz4)

# cast viz4 df
viz4.2007onwards <- dcast(viz4, year ~ word, value.var = "count")
colnames(viz4.2007onwards)[2] <- "num.unique.words"

write.csv(viz4.2007onwards, "viz42007onwards.csv")
# write.csv(viz4.2, "viz4.csv") # write viz4

# write.csv(words.table, "allWordsFreq.csv") # csv of all unique words and frequency
# write.csv(all.words.vect, "allWordsVect.csv")

