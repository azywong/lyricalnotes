install.packages("rjson")
library("rjson")
library(stringr)
library(magrittr)
library(lubridate)

# ---------------------------------------------------------------
# read lyric files

test <- fromJSON(file="lyricalnotes/data/26760-lyrics.json")

lyrics <- test$lyrics %>%
  str_replace_all("[\n]" , " ") %>% # replace new lines
  str_replace_all(",", "") %>% # remove commas
  str_replace_all("'", "") %>% # remove apostrophes
  str_replace_all("  ", " ") %>% # remove double spaces
  tolower() # to lowercase

lyrics.df <- unlist(strsplit(lyrics, " ")) %>%
  table() %>%
  as.data.frame()

# ---------------------------------------------------------------
# read billboard files

# testing
# test <- fromJSON(file="lyricalnotes/data/1990-1-6.json")
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

setwd("Desktop/Billboard 1990 - 2015/") # set wd
files <- Sys.glob("*.json") # get files with same extension

df <- as.character(data.frame()) # data frame for all longs
for (f in 1:length(files)) { # loop through each file
  obj <- fromJSON(file = files[f])
  date <- str_replace_all(files[f], ".json", "") # remove extension and get date
  # print(date) # check for progress
  songs <- obj$songs
  if (length(songs) == 0) {
    print(paste("ERROR: ", date))
  }
  else {
    for (i in 1:length(songs)) { # loop through songs in each list
      if (length(songs) != 100) { # check which length not 100
        print("NOT 100 SONGS: ", date)
      }
      song <- songs[[i]]
      song.vect <- c(date, song$rank, song$song_name, song$display_artist)
      df <- rbind(df, song.vect)
    }
  }
}
colnames(df) <- c("Date", "Rank", "Song Name", "Artist") # set column names
rownames(df) <- NULL # get rid of row names
df <- as.data.frame(df) # coerce to dataframe

df$Date <- as.Date(df$Date, "%Y-%m-%d")
df <- df[order(as.Date(df$Date, format = "%Y-%m-%d")),] # order by date
write.csv(df, "billboard.csv") # write data frame to csv

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



